// ===== Navegação entre as seções do dashboard (card 04) =====
const linksNav = document.querySelectorAll(".app-nav a[data-secao]");
const secoes = document.querySelectorAll(".secao");

function mostrarSecao(id) {
  const existe = Array.from(secoes).some(secao => secao.id === id);
  const alvo = existe ? id : "resumo";

  secoes.forEach(secao => {
    secao.hidden = secao.id !== alvo;
  });
  linksNav.forEach(link => {
    if (link.dataset.secao === alvo) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

window.addEventListener("hashchange", () => mostrarSecao(location.hash.slice(1)));
mostrarSecao(location.hash.slice(1));
