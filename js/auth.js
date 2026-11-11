// ===== Proteção de acesso e logout (card 04) =====
// Depende do app.js (obterSessao, STORAGE_KEYS). Carregar no <head>, depois do app.js,
// para o redirecionamento acontecer antes da página ser exibida.

const PAGINA_LOGIN = "index.html";

function sairDaSessao() {
  localStorage.removeItem(STORAGE_KEYS.sessao);
  // replace: o dashboard não fica no histórico, então "voltar" não reabre a área logada
  window.location.replace(PAGINA_LOGIN);
}

// Sem sessão válida, volta para o login
function protegerPagina() {
  const sessao = obterSessao();
  if (!sessao || !sessao.email) {
    window.location.replace(PAGINA_LOGIN);
    return null;
  }
  return sessao;
}

const sessaoAtual = protegerPagina();

// Página restaurada do cache ao usar "voltar" (bfcache): confere a sessão de novo
window.addEventListener("pageshow", evento => {
  if (evento.persisted) protegerPagina();
});

document.addEventListener("DOMContentLoaded", () => {
  if (!sessaoAtual) return;

  const nome = document.getElementById("nome-usuario");
  if (nome) nome.textContent = sessaoAtual.nome;

  const btnSair = document.getElementById("btn-sair");
  if (btnSair) btnSair.addEventListener("click", sairDaSessao);
});
