create schema if not exists extensions;

create table if not exists public.eventos_cognitivos (
  id text primary key,
  timestamp timestamptz not null,
  tipo text not null,
  status text not null default 'ativo',
  titulo text not null,
  resumo text not null,
  contexto text not null default '',
  assuntos text[] not null default '{}',
  projetos text[] not null default '{}',
  ideias text[] not null default '{}',
  decisoes text[] not null default '{}',
  hipoteses text[] not null default '{}',
  questoes_abertas text[] not null default '{}',
  proximos_passos text[] not null default '{}',
  metadados jsonb not null default '{}',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists public.fontes (
  id text primary key,
  evento_id text not null references public.eventos_cognitivos(id) on delete cascade,
  tipo_de_fonte text not null,
  provedor text,
  referencia text,
  escopo_da_captura text not null,
  conteudo_bruto text,
  metadados jsonb not null default '{}',
  criado_em timestamptz not null default now()
);

create table if not exists public.relacoes (
  id text primary key,
  evento_origem_id text not null references public.eventos_cognitivos(id) on delete cascade,
  evento_destino_id text references public.eventos_cognitivos(id) on delete cascade,
  tipo text not null,
  rotulo text,
  criado_em timestamptz not null default now()
);

create table if not exists public.configuracao_privada (
  id text primary key,
  usuario text not null,
  salt text not null,
  senha_hash text not null,
  metadados jsonb not null default '{}',
  atualizado_em timestamptz not null default now()
);

alter table public.eventos_cognitivos enable row level security;
alter table public.fontes enable row level security;
alter table public.relacoes enable row level security;
alter table public.configuracao_privada enable row level security;

create or replace function public.registrar_evento_cognitivo(
  p_evento jsonb,
  p_fontes jsonb default '[]'::jsonb,
  p_relacoes jsonb default '[]'::jsonb
)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_id text := nullif(btrim(p_evento ->> 'id'), '');
  v_existente public.eventos_cognitivos%rowtype;
  v_item jsonb;
  v_item_id text;
begin
  if v_id is null then
    raise exception 'EVENTO_ID_OBRIGATORIO';
  end if;

  select * into v_existente
  from public.eventos_cognitivos
  where id = v_id;

  if found then
    if v_existente.timestamp = (p_evento ->> 'timestamp')::timestamptz
      and v_existente.tipo = p_evento ->> 'tipo'
      and v_existente.titulo = p_evento ->> 'titulo'
      and v_existente.resumo = p_evento ->> 'resumo'
    then
      return 'existente';
    end if;
    raise exception 'COLISAO_ID';
  end if;

  insert into public.eventos_cognitivos (
    id, timestamp, tipo, status, titulo, resumo, contexto,
    assuntos, projetos, ideias, decisoes, hipoteses,
    questoes_abertas, proximos_passos, metadados
  ) values (
    v_id,
    (p_evento ->> 'timestamp')::timestamptz,
    p_evento ->> 'tipo',
    coalesce(nullif(p_evento ->> 'status', ''), 'ativo'),
    p_evento ->> 'titulo',
    p_evento ->> 'resumo',
    coalesce(p_evento ->> 'contexto', ''),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'assuntos', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'projetos', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'ideias', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'decisoes', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'hipoteses', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'questoes_abertas', '[]'::jsonb))),
    array(select jsonb_array_elements_text(coalesce(p_evento -> 'proximos_passos', '[]'::jsonb))),
    coalesce(p_evento -> 'metadados', '{}'::jsonb)
  );

  for v_item in select value from jsonb_array_elements(coalesce(p_fontes, '[]'::jsonb))
  loop
    v_item_id := coalesce(
      nullif(btrim(v_item ->> 'id'), ''),
      concat('fonte-', v_id, '-', substr(md5(v_item::text), 1, 12))
    );
    insert into public.fontes (
      id, evento_id, tipo_de_fonte, provedor, referencia,
      escopo_da_captura, conteudo_bruto, metadados
    ) values (
      v_item_id,
      v_id,
      coalesce(nullif(v_item ->> 'tipo_de_fonte', ''), 'registro'),
      v_item ->> 'provedor',
      v_item ->> 'referencia',
      coalesce(nullif(v_item ->> 'escopo_da_captura', ''), 'evento cognitivo'),
      v_item ->> 'conteudo_bruto',
      coalesce(v_item -> 'metadados', '{}'::jsonb)
    ) on conflict (id) do nothing;
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(p_relacoes, '[]'::jsonb))
  loop
    v_item_id := coalesce(
      nullif(btrim(v_item ->> 'id'), ''),
      concat('relacao-', v_id, '-', substr(md5(v_item::text), 1, 12))
    );
    insert into public.relacoes (
      id, evento_origem_id, evento_destino_id, tipo, rotulo
    ) values (
      v_item_id,
      v_id,
      nullif(v_item ->> 'evento_destino_id', ''),
      v_item ->> 'tipo',
      v_item ->> 'rotulo'
    ) on conflict (id) do nothing;
  end loop;

  return 'criado';
end;
$$;

revoke all on table public.eventos_cognitivos from public, anon, authenticated;
revoke all on table public.fontes from public, anon, authenticated;
revoke all on table public.relacoes from public, anon, authenticated;
revoke all on table public.configuracao_privada from public, anon, authenticated;
grant all on table public.eventos_cognitivos to service_role;
grant all on table public.fontes to service_role;
grant all on table public.relacoes to service_role;
grant all on table public.configuracao_privada to service_role;
revoke execute on function public.registrar_evento_cognitivo(jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.registrar_evento_cognitivo(jsonb, jsonb, jsonb)
  to service_role;

