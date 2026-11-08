// ===== Resumo financeiro e gráfico de despesas (card 07) =====
// Depende de app.js, auth.js (sessaoAtual), filtros.js (filtroMes, filtroAno, NOMES_MESES)
// e transacoes.js (transacoesDoUsuario). Carregar depois de transacoes.js.

const resumoMes = document.getElementById("resumo-mes");
const resumoAno = document.getElementById("resumo-ano");
const elTotalReceitas = document.getElementById("total-receitas");
const elTotalDespesas = document.getElementById("total-despesas");
const elSaldo = document.getElementById("saldo-mes");
const elRotuloSaldo = document.getElementById("rotulo-saldo");
const elResumoVazio = document.getElementById("resumo-vazio");
const elGrafico = document.getElementById("resumo-grafico");
const canvasGrafico = document.getElementById("grafico-despesas");
const legendaDespesas = document.getElementById("legenda-despesas");

const CORES_GRAFICO = [
  "#d64545", "#e8833a", "#e3b341", "#4c9f70", "#3d8bd9",
  "#7a5cc7", "#c2549d", "#2aa5a5", "#8d6e63", "#6b7c93"
];

// Soma em centavos para evitar erros de ponto flutuante (0.1 + 0.2)
function somarCentavos(lista) {
  return lista.reduce((soma, t) => soma + Math.round(t.valor * 100), 0);
}

// Lançamentos do período escolhido (só mês/ano; tipo, categoria e busca não afetam o resumo)
function lancamentosDoPeriodo() {
  const mes = filtroMes.value;
  const ano = filtroAno.value;
  return transacoesDoUsuario().filter(t =>
    (mes === "todos" || mesDaData(t.data) === mes) &&
    (ano === "todos" || anoDaData(t.data) === ano)
  );
}

function textoPeriodo() {
  const mes = filtroMes.value;
  const ano = filtroAno.value;
  const nomeMes = mes === "todos" ? "" : NOMES_MESES[Number(mes) - 1];
  if (mes === "todos" && ano === "todos") return "todo o período";
  if (mes === "todos") return `o ano de ${ano}`;
  if (ano === "todos") return `${nomeMes} (todos os anos)`;
  return `${nomeMes} de ${ano}`;
}

// Mantém os selects do resumo iguais aos filtros do card 06
function sincronizarSelects() {
  resumoMes.replaceChildren(...[...filtroMes.options].map(o => o.cloneNode(true)));
  resumoAno.replaceChildren(...[...filtroAno.options].map(o => o.cloneNode(true)));
  resumoMes.value = filtroMes.value;
  resumoAno.value = filtroAno.value;
}

function aplicarNoFiltro(filtro, valor) {
  filtro.value = valor;
  filtro.dispatchEvent(new Event("change")); // filtros.js atualiza a tabela e o resumo
}

// ----- Gráfico (canvas puro): rosca de despesas por categoria -----
function desenharGrafico(fatias, totalCentavos) {
  const tamanho = 260;
  const escala = window.devicePixelRatio || 1;
  canvasGrafico.width = tamanho * escala;
  canvasGrafico.height = tamanho * escala;
  canvasGrafico.style.width = `${tamanho}px`;
  canvasGrafico.style.height = `${tamanho}px`;

  const ctx = canvasGrafico.getContext("2d");
  ctx.setTransform(escala, 0, 0, escala, 0, 0);
  ctx.clearRect(0, 0, tamanho, tamanho);

  const centro = tamanho / 2;
  const raioExterno = centro - 4;
  const raioInterno = raioExterno * 0.6;
  let inicio = -Math.PI / 2;

  fatias.forEach(fatia => {
    const angulo = (fatia.centavos / totalCentavos) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(centro, centro, raioExterno, inicio, inicio + angulo);
    ctx.arc(centro, centro, raioInterno, inicio + angulo, inicio, true);
    ctx.closePath();
    ctx.fillStyle = fatia.cor;
    ctx.fill();
    inicio += angulo;
  });

  ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 13px sans-serif";
  ctx.fillText("Despesas", centro, centro - 12);
  ctx.font = "700 16px sans-serif";
  ctx.fillText(formatarMoeda(totalCentavos / 100), centro, centro + 10);
}

function montarLegenda(fatias, totalCentavos) {
  legendaDespesas.replaceChildren(...fatias.map(fatia => {
    const item = document.createElement("li");

    const cor = document.createElement("span");
    cor.className = "legenda-cor";
    cor.style.background = fatia.cor;

    const nome = document.createElement("span");
    nome.className = "legenda-nome";
    nome.textContent = fatia.categoria;

    const valor = document.createElement("span");
    valor.className = "legenda-valor";
    const percentual = ((fatia.centavos / totalCentavos) * 100).toFixed(1).replace(".", ",");
    valor.textContent = `${formatarMoeda(fatia.centavos / 100)} (${percentual}%)`;

    item.append(cor, nome, valor);
    return item;
  }));
}

// Despesas agrupadas por categoria, da maior para a menor
function fatiasDeDespesas(despesas) {
  const porCategoria = new Map();
  despesas.forEach(t => {
    porCategoria.set(t.categoria, (porCategoria.get(t.categoria) || 0) + Math.round(t.valor * 100));
  });
  return [...porCategoria.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, centavos], i) => ({
      categoria,
      centavos,
      cor: CORES_GRAFICO[i % CORES_GRAFICO.length]
    }));
}

// ----- Renderização -----
function renderizarResumo() {
  sincronizarSelects();

  const periodo = lancamentosDoPeriodo();
  const despesasLista = periodo.filter(t => t.tipo === "despesa");
  const receitas = somarCentavos(periodo.filter(t => t.tipo === "receita"));
  const despesas = somarCentavos(despesasLista);
  const saldo = receitas - despesas;

  elTotalReceitas.textContent = formatarMoeda(receitas / 100);
  elTotalDespesas.textContent = formatarMoeda(despesas / 100);
  elSaldo.textContent = formatarMoeda(saldo / 100);
  elSaldo.classList.toggle("receita", saldo > 0);
  elSaldo.classList.toggle("despesa", saldo < 0);
  elRotuloSaldo.textContent = filtroMes.value === "todos" ? "Saldo do período" : "Saldo do mês";

  if (periodo.length === 0) {
    elResumoVazio.textContent = `Nenhum lançamento em ${textoPeriodo()}. Adicione um na aba Lançamentos.`;
    elResumoVazio.hidden = false;
    elGrafico.hidden = true;
    return;
  }

  if (despesasLista.length === 0) {
    elResumoVazio.textContent = `Nenhuma despesa em ${textoPeriodo()}.`;
    elResumoVazio.hidden = false;
    elGrafico.hidden = true;
    return;
  }

  elResumoVazio.hidden = true;
  elGrafico.hidden = false;
  const fatias = fatiasDeDespesas(despesasLista);
  desenharGrafico(fatias, despesas);
  montarLegenda(fatias, despesas);
  canvasGrafico.setAttribute(
    "aria-label",
    "Despesas por categoria: " + fatias.map(f => `${f.categoria} ${formatarMoeda(f.centavos / 100)}`).join(", ")
  );
}

// ----- Eventos -----
resumoMes.addEventListener("change", () => aplicarNoFiltro(filtroMes, resumoMes.value));
resumoAno.addEventListener("change", () => aplicarNoFiltro(filtroAno, resumoAno.value));

// Filtros do card 06 (mês/ano, e "Limpar filtros")
[filtroMes, filtroAno].forEach(campo => campo.addEventListener("change", renderizarResumo));
btnLimparFiltros.addEventListener("click", renderizarResumo);

// Criar, editar ou excluir lançamentos (evento disparado pelo transacoes.js)
document.addEventListener("transacoes:alteradas", renderizarResumo);

// ----- Início -----
if (sessaoAtual) renderizarResumo();
