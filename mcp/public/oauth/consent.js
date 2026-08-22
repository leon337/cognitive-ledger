import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const config = globalThis.COGNITIVE_LEDGER_OAUTH_CONFIG;
const estado = document.querySelector('#estado');
const detalhes = document.querySelector('#detalhes');
const cliente = document.querySelector('#cliente');
const redirect = document.querySelector('#redirect');
const escopos = document.querySelector('#escopos');
const aprovar = document.querySelector('#aprovar');
const negar = document.querySelector('#negar');

function falhar(mensagem) {
  estado.textContent = mensagem;
  detalhes.hidden = true;
}

if (!config?.supabaseUrl || !config?.publishableKey) {
  falhar('Configuração OAuth indisponível.');
} else {
  const authorizationId = new URL(location.href).searchParams.get('authorization_id');

  if (!authorizationId) {
    falhar('Solicitação inválida: authorization_id ausente.');
  } else {
    const supabase = createClient(config.supabaseUrl, config.publishableKey);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      const retorno = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
      location.assign(`/login?redirect=${encodeURIComponent(retorno)}`);
    } else {
      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

      if (error || !data) {
        falhar(error?.message || 'Solicitação de autorização inválida.');
      } else if (!('authorization_id' in data) && data.redirect_url) {
        location.assign(data.redirect_url);
      } else {
        estado.textContent = 'Revise o acesso solicitado.';
        cliente.textContent = data.client?.name || 'Cliente OAuth';
        redirect.textContent = data.redirect_uri || '';
        escopos.replaceChildren(...String(data.scope || '')
          .split(/\s+/)
          .filter(Boolean)
          .map((scope) => {
            const item = document.createElement('li');
            item.textContent = scope;
            return item;
          }));
        detalhes.hidden = false;

        async function decidir(decisao) {
          aprovar.disabled = true;
          negar.disabled = true;
          const metodo = decisao === 'aprovar'
            ? supabase.auth.oauth.approveAuthorization.bind(supabase.auth.oauth)
            : supabase.auth.oauth.denyAuthorization.bind(supabase.auth.oauth);
          const resultado = await metodo(authorizationId);
          if (resultado.error || !resultado.data?.redirect_url) {
            falhar(resultado.error?.message || 'Não foi possível concluir a autorização.');
            aprovar.disabled = false;
            negar.disabled = false;
            return;
          }
          location.assign(resultado.data.redirect_url);
        }

        aprovar.addEventListener('click', () => decidir('aprovar'));
        negar.addEventListener('click', () => decidir('negar'));
      }
    }
  }
}
