import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.3/+esm';

const config = globalThis.COGNITIVE_LEDGER_OAUTH_CONFIG;
const estado = document.querySelector('#estado');
const form = document.querySelector('#form-login');
const enviar = document.querySelector('#enviar');

function retornoSeguro(valor) {
  if (!valor) return null;
  try {
    const url = new URL(valor, location.origin);
    if (url.origin !== location.origin || url.pathname !== '/oauth/consent') return null;
    if (!url.searchParams.get('authorization_id')) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

const retorno = retornoSeguro(new URL(location.href).searchParams.get('redirect'));

if (!config?.supabaseUrl || !config?.publishableKey || !retorno) {
  estado.textContent = 'Solicitação de login inválida.';
  form.hidden = true;
} else {
  const supabase = createClient(config.supabaseUrl, config.publishableKey);
  const { data: sessao } = await supabase.auth.getSession();
  if (sessao?.session) {
    location.replace(retorno);
  } else {
    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      enviar.disabled = true;
      const email = new FormData(form).get('email');
      const destino = new URL(retorno, location.origin).toString();
      const { error } = await supabase.auth.signInWithOtp({
        email: String(email || '').trim(),
        options: { shouldCreateUser: false, emailRedirectTo: destino },
      });
      if (error) {
        estado.textContent = 'Não foi possível enviar o link de acesso.';
        enviar.disabled = false;
        return;
      }
      estado.textContent = 'Link enviado. Abra o e-mail para continuar a autorização.';
      form.hidden = true;
    });
  }
}
