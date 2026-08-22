import { createClient } from "npm:@supabase/supabase-js@2";
import {
  autenticarClienteOAuth,
  ErroAutorizacao,
  tipoBoundary,
} from "./lib/autorizacao.ts";
import type { ClaimsOAuth, ClienteAutorizado } from "./lib/contratos.ts";

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const chaves = Deno.env.get("SUPABASE_SECRET_KEYS");
  const legado = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const chave = chaves ? JSON.parse(chaves).default : legado;
  if (!url || !chave) {
    throw new Error("Configuração administrativa indisponível");
  }
  return createClient(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function naoAutorizado() {
  return new Response("Autenticação necessária.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Cognitive Ledger", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function lerBasic(req: Request) {
  const cabecalho = req.headers.get("authorization") || "";
  if (!cabecalho.startsWith("Basic ")) return null;
  try {
    const texto = atob(cabecalho.slice(6));
    const separador = texto.indexOf(":");
    if (separador < 0) return null;
    return {
      usuario: texto.slice(0, separador),
      senha: texto.slice(separador + 1),
    };
  } catch {
    return null;
  }
}

async function sha256Hex(texto: string) {
  const bytes = new TextEncoder().encode(texto);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function igualConstante(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diferenca = 0;
  for (let i = 0; i < a.length; i += 1) {
    diferenca |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferenca === 0;
}

async function autorizado(
  req: Request,
  supabase: ReturnType<typeof adminClient>,
) {
  const basic = lerBasic(req);
  if (!basic) return false;

  const { data, error } = await supabase
    .from("configuracao_privada")
    .select("usuario,salt,senha_hash")
    .eq("id", "autenticacao_basica")
    .single();

  if (error || !data || basic.usuario !== data.usuario) return false;
  const hash = await sha256Hex(`${data.salt}${basic.senha}`);
  return igualConstante(hash, data.senha_hash);
}

function decodificarJwt(token: string): ClaimsOAuth {
  const partes = token.split(".");
  if (partes.length !== 3) throw new Error("jwt_invalido");
  const base64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
  return JSON.parse(atob(padded));
}

async function verificarJwtSupabase(
  token: string,
  supabase: ReturnType<typeof adminClient>,
) {
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("token_invalido");
  const claims = decodificarJwt(token);
  if (claims.sub !== data.user.id) throw new Error("sub_divergente");
  return claims;
}

async function obterClienteOAuth(
  supabase: ReturnType<typeof adminClient>,
  clientId: string,
) {
  const { data, error } = await supabase
    .from("clientes_autorizados")
    .select("client_id,owner_id,capacidades,ativo,revogado_em")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data as ClienteAutorizado | null;
}

async function registrarClienteOAuth(
  supabase: ReturnType<typeof adminClient>,
  entrada: { clientId: string; ownerId: string; capacidades: string[] },
) {
  const { data, error } = await supabase
    .from("clientes_autorizados")
    .upsert({
      client_id: entrada.clientId,
      owner_id: entrada.ownerId,
      rotulo: entrada.clientId,
      capacidades: entrada.capacidades,
      ativo: true,
      revogado_em: null,
    }, { onConflict: "client_id" })
    .select("client_id,owner_id,capacidades,ativo,revogado_em")
    .single();
  if (error || !data) throw error || new Error("cliente_nao_registrado");
  return data as ClienteAutorizado;
}

function respostaErroOAuth(erro: unknown) {
  if (erro instanceof ErroAutorizacao) {
    return new Response(JSON.stringify({ erro: erro.codigo.toLowerCase() }), {
      status: erro.status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store, private",
        ...(erro.status === 401
          ? { "WWW-Authenticate": 'Bearer realm="Cognitive Ledger"' }
          : {}),
      },
    });
  }
  return json({ erro: "oauth_indisponivel" }, 503);
}

function rotulo(id: string) {
  return String(id)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function obterTimeline(supabase: ReturnType<typeof adminClient>) {
  const [eventosResp, fontesResp, relacoesResp] = await Promise.all([
    supabase.from("eventos_cognitivos").select("*").order("timestamp", {
      ascending: false,
    }),
    supabase.from("fontes").select("*"),
    supabase.from("relacoes").select("*"),
  ]);

  const erro = eventosResp.error || fontesResp.error || relacoesResp.error;
  if (erro) throw erro;

  const fontesPorEvento = new Map<string, any[]>();
  for (const fonte of fontesResp.data || []) {
    if (!fontesPorEvento.has(fonte.evento_id)) {
      fontesPorEvento.set(fonte.evento_id, []);
    }
    fontesPorEvento.get(fonte.evento_id)!.push(fonte);
  }

  const relacoesPorEvento = new Map<string, any[]>();
  for (const relacao of relacoesResp.data || []) {
    if (!relacoesPorEvento.has(relacao.evento_origem_id)) {
      relacoesPorEvento.set(relacao.evento_origem_id, []);
    }
    relacoesPorEvento.get(relacao.evento_origem_id)!.push(relacao);
  }

  const registros = (eventosResp.data || []).map((evento) => {
    const fonte = fontesPorEvento.get(evento.id)?.[0];
    return {
      id: evento.id,
      timestamp: evento.timestamp,
      tipo: evento.tipo,
      status: evento.status,
      titulo: evento.titulo,
      resumo: evento.resumo,
      contexto: evento.contexto,
      projetos: evento.projetos || [],
      assuntos: evento.assuntos || [],
      ideias: evento.ideias || [],
      decisoes: evento.decisoes || [],
      hipoteses: evento.hipoteses || [],
      questoes_abertas: evento.questoes_abertas || [],
      proximos_passos: evento.proximos_passos || [],
      relacoes: (relacoesPorEvento.get(evento.id) || []).map((r) => ({
        tipo: r.tipo,
        destino: r.evento_destino_id || "",
        rotulo: r.rotulo || r.tipo,
      })),
      fonte: fonte
        ? {
          tipo: fonte.tipo_de_fonte,
          provedor: fonte.provedor,
          escopo: fonte.escopo_da_captura,
          referencia: fonte.referencia,
          observacao: fonte.metadados?.observacao ||
            "Fonte privada vinculada ao registro cognitivo.",
        }
        : {
          tipo: "registro",
          provedor: "Cognitive Ledger",
          escopo: "evento cognitivo",
          referencia: null,
          observacao: evento.metadados?.proveniencia ||
            "Registro sem fonte separada.",
        },
    };
  });

  const tiposIds = [...new Set(registros.map((r) => r.tipo))];
  const projetosIds = [...new Set(registros.flatMap((r) => r.projetos || []))];

  return {
    meta: {
      versao: 2,
      demonstracao: false,
      aviso:
        "Timeline privada carregada do armazenamento operacional do Cognitive Ledger.",
    },
    tipos: tiposIds.map((id) => ({ id, rotulo: rotulo(id) })),
    projetos: projetosIds.map((id) => ({ id, rotulo: rotulo(id) })),
    registros,
  };
}

function validarEvento(evento: any) {
  const obrigatorios = ["id", "timestamp", "tipo", "titulo", "resumo"];
  return evento &&
    obrigatorios.every((campo) =>
      typeof evento[campo] === "string" && evento[campo].trim()
    );
}

Deno.serve(async (req: Request) => {
  let supabase;
  try {
    supabase = adminClient();
  } catch {
    return json({ erro: "backend_indisponivel" }, 503);
  }

  const pathname = new URL(req.url).pathname;

  if (tipoBoundary(pathname) === "oauth") {
    const ownerId = Deno.env.get("COGNITIVE_LEDGER_OWNER_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!ownerId || !supabaseUrl) {
      return json({ erro: "oauth_indisponivel" }, 503);
    }
    try {
      await autenticarClienteOAuth(req, {
        ownerId,
        issuer: `${supabaseUrl}/auth/v1`,
        verificarJwt: (token) => verificarJwtSupabase(token, supabase),
        obterCliente: (clientId) => obterClienteOAuth(supabase, clientId),
        registrarCliente: (entrada) => registrarClienteOAuth(supabase, entrada),
      });
    } catch (erro) {
      return respostaErroOAuth(erro);
    }
    return json({ erro: "rota_nao_encontrada" }, 404);
  }

  if (!(await autorizado(req, supabase))) return naoAutorizado();

  if (req.method === "GET" && pathname.endsWith("/timeline")) {
    try {
      return json(await obterTimeline(supabase));
    } catch {
      return json({ erro: "falha_ao_ler_timeline" }, 500);
    }
  }

  if (req.method === "POST" && pathname.endsWith("/registros")) {
    let corpo: any;
    try {
      corpo = await req.json();
    } catch {
      return json({ erro: "json_invalido" }, 400);
    }

    if (!validarEvento(corpo?.evento)) {
      return json({ erro: "evento_invalido" }, 400);
    }

    const { data, error } = await supabase.rpc("registrar_evento_cognitivo", {
      p_evento: corpo.evento,
      p_fontes: Array.isArray(corpo.fontes) ? corpo.fontes : [],
      p_relacoes: Array.isArray(corpo.relacoes) ? corpo.relacoes : [],
    });

    if (error) {
      if (String(error.message || "").includes("COLISAO_ID")) {
        return json({ erro: "colisao_de_id" }, 409);
      }
      return json({ erro: "falha_ao_registrar" }, 500);
    }

    return json(
      { status: data, id: corpo.evento.id },
      data === "criado" ? 201 : 200,
    );
  }

  return json({ erro: "rota_nao_encontrada" }, 404);
});
