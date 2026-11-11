// ===== Filtros dos lançamentos (card 06) =====
// Mês, ano, tipo, categoria e busca na descrição — todos combinados (E).
// Depende do app.js (normalizarTexto) e do categorias.js (categoriasDoUsuario).
// A tabela chama aplicarFiltros(lista) a cada renderização (ver transacoes.js).

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const formFiltros = document.getElementById("form-filtros");
const filtroMes = document.getElementById("filtro-mes");
const filtroAno = document.getElementById("filtro-ano");
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroBusca = document.getElementById("filtro-busca");
const btnLimparFiltros = document.getElementById("btn-limpar-filtros");

function criarOpcaoFiltro(valor, texto) {
  const opcao = document.createElement("option");
  opcao.value = valor;
  opcao.textContent = texto;
  return opcao;
}

// Lê ano e mês da data ISO (AAAA-MM-DD) pelo separador, e não por posição fixa,
// para não errar em anos com mais de 4 dígitos
function anoDaData(dataISO) {
  return dataISO.split("-")[0];
}

function mesDaData(dataISO) {
  return dataISO.split("-")[1];
}

// ----- Montagem dos selects -----
function preencherMeses() {
  filtroMes.replaceChildren(
    criarOpcaoFiltro("todos", "Todos os meses"),
    ...NOMES_MESES.map((nome, i) => criarOpcaoFiltro(String(i + 1).padStart(2, "0"), nome))
  );
}

// Anos: o atual + os anos que têm lançamentos (+ o ano escolhido, mesmo que fique sem lançamentos)
function atualizarOpcoesAno(lancamentos) {
  const selecionado = filtroAno.value;
  const anos = new Set([String(new Date().getFullYear())]);
  lancamentos.forEach(t => anos.add(anoDaData(t.data)));
  if (selecionado && selecionado !== "todos") anos.add(selecionado);

  const ordenados = [...anos].sort((a, b) => b.localeCompare(a));
  filtroAno.replaceChildren(
    criarOpcaoFiltro("todos", "Todos os anos"),
    ...ordenados.map(ano => criarOpcaoFiltro(ano, ano))
  );
  filtroAno.value = selecionado || String(new Date().getFullYear());
}

// Retorna true se a categoria escolhida deixou de existir (e o filtro voltou para "Todas")
function atualizarOpcoesCategoria() {
  const selecionada = filtroCategoria.value;
  const nomes = categoriasDoUsuario().map(c => c.nome);
  filtroCategoria.replaceChildren(
    criarOpcaoFiltro("todas", "Todas as categorias"),
    ...nomes.map(nome => criarOpcaoFiltro(nome, nome))
  );
  const continuaValida = nomes.includes(selecionada);
  filtroCategoria.value = continuaValida ? selecionada : "todas";
  return Boolean(selecionada) && !continuaValida && selecionada !== "todas";
}

// ----- Filtragem -----
function aplicarFiltros(lancamentos) {
  atualizarOpcoesAno(lancamentos);

  const mes = filtroMes.value;
  const ano = filtroAno.value;
  const tipo = filtroTipo.value;
  const categoria = filtroCategoria.value;
  const busca = normalizarTexto(filtroBusca.value);

  return lancamentos.filter(t =>
    (mes === "todos" || mesDaData(t.data) === mes) &&
    (ano === "todos" || anoDaData(t.data) === ano) &&
    (tipo === "todos" || t.tipo === tipo) &&
    (categoria === "todas" || t.categoria === categoria) &&
    (!busca || normalizarTexto(t.descricao).includes(busca))
  );
}

// "Limpar filtros" tira todos os filtros: mostra todos os lançamentos, de todos os meses e anos
function limparFiltros() {
  filtroMes.value = "todos";
  filtroAno.value = "todos";
  filtroTipo.value = "todos";
  filtroCategoria.value = "todas";
  filtroBusca.value = "";
  renderizarTabela();
}

// ----- Eventos -----
[filtroMes, filtroAno, filtroTipo, filtroCategoria].forEach(campo =>
  campo.addEventListener("change", () => renderizarTabela())
);
filtroBusca.addEventListener("input", () => renderizarTabela());
btnLimparFiltros.addEventListener("click", limparFiltros);
// Enter no campo de busca não deve enviar/recarregar a página
formFiltros.addEventListener("submit", evento => evento.preventDefault());

document.addEventListener("categorias:alteradas", () => {
  if (atualizarOpcoesCategoria()) renderizarTabela();
});

// ----- Início: padrão = mês e ano atuais -----
if (sessaoAtual) {
  const hoje = new Date();
  preencherMeses();
  filtroMes.value = String(hoje.getMonth() + 1).padStart(2, "0");
  atualizarOpcoesAno([]);
  filtroAno.value = String(hoje.getFullYear());
  atualizarOpcoesCategoria();
}
