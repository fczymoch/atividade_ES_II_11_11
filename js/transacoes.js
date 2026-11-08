// ===== Lançamentos: CRUD de receitas e despesas (card 05) =====
// Categorias vêm do categorias.js e os filtros do filtros.js (carregar antes deste arquivo).
// Depende do app.js (STORAGE_KEYS, lerStorage, salvarStorage, formatarMoeda, formatarData)
// e do auth.js (sessaoAtual). Cada lançamento guarda o e-mail do dono.

const formLancamento = document.getElementById("form-lancamento");
const campoDescricao = document.getElementById("descricao");
const campoValor = document.getElementById("valor");
const campoTipo = document.getElementById("tipo");
const campoCategoria = document.getElementById("categoria");
const campoData = document.getElementById("data");
const erroDescricao = document.getElementById("erro-descricao");
const erroValor = document.getElementById("erro-valor");
const erroData = document.getElementById("erro-data");
const btnSalvar = document.getElementById("btn-salvar");
const btnCancelar = document.getElementById("btn-cancelar");
const tituloForm = document.getElementById("titulo-form");
const tabela = document.getElementById("tabela-lancamentos");
const corpoTabela = document.getElementById("corpo-lancamentos");
const listaVazia = document.getElementById("lista-vazia");
const contagemLancamentos = document.getElementById("contagem-lancamentos");

let idEditando = null;   // lançamento em edição (null = criando)
let idExcluindo = null;  // lançamento aguardando confirmação de exclusão

// ----- Persistência -----
function lerTodasTransacoes() {
  return lerStorage(STORAGE_KEYS.transacoes, []);
}

// Só os lançamentos do usuário logado, mais recentes primeiro
function transacoesDoUsuario() {
  return lerTodasTransacoes()
    .filter(t => t.email === sessaoAtual.email)
    .sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm.localeCompare(a.criadoEm));
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ----- Utilidades de formulário -----
function dataHojeISO() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

function mostrarErroCampo(campo, elementoErro, texto) {
  elementoErro.textContent = texto;
  campo.setAttribute("aria-invalid", texto ? "true" : "false");
}

// Monta o <select> com as categorias do usuário (padrão + próprias), mantendo a escolha atual
function preencherCategorias() {
  const atual = campoCategoria.value;
  const nomes = categoriasDoUsuario().map(c => c.nome);
  campoCategoria.replaceChildren(...nomes.map(nome => {
    const opcao = document.createElement("option");
    opcao.value = nome;
    opcao.textContent = nome;
    return opcao;
  }));
  campoCategoria.value = nomes.includes(atual) ? atual : CATEGORIA_PADRAO_FALLBACK;
}

// ----- Validação -----
function validarDescricao() {
  if (!campoDescricao.value.trim()) {
    mostrarErroCampo(campoDescricao, erroDescricao, "Informe a descrição.");
    return false;
  }
  mostrarErroCampo(campoDescricao, erroDescricao, "");
  return true;
}

function validarValor() {
  const valor = Number(campoValor.value);
  if (campoValor.value === "" || !Number.isFinite(valor) || valor <= 0) {
    mostrarErroCampo(campoValor, erroValor, "Informe um valor maior que zero.");
    return false;
  }
  mostrarErroCampo(campoValor, erroValor, "");
  return true;
}

function validarData() {
  if (!campoData.value) {
    mostrarErroCampo(campoData, erroData, "Informe a data.");
    return false;
  }
  mostrarErroCampo(campoData, erroData, "");
  return true;
}

// ----- Formulário: criar / editar -----
function limparFormulario() {
  idEditando = null;
  formLancamento.reset();
  campoTipo.value = "despesa";
  campoCategoria.value = CATEGORIA_PADRAO_FALLBACK;
  campoData.value = dataHojeISO();
  [
    [campoDescricao, erroDescricao],
    [campoValor, erroValor],
    [campoData, erroData]
  ].forEach(([campo, erro]) => mostrarErroCampo(campo, erro, ""));
  tituloForm.textContent = "Novo lançamento";
  btnSalvar.textContent = "Adicionar";
  btnCancelar.hidden = true;
}

function iniciarEdicao(id) {
  const transacao = transacoesDoUsuario().find(t => t.id === id);
  if (!transacao) return;

  idEditando = id;
  idExcluindo = null;
  campoDescricao.value = transacao.descricao;
  campoValor.value = transacao.valor;
  campoTipo.value = transacao.tipo;
  // categoria que não existe mais na lista não pode sumir da edição
  if (![...campoCategoria.options].some(o => o.value === transacao.categoria)) {
    const opcao = document.createElement("option");
    opcao.value = transacao.categoria;
    opcao.textContent = transacao.categoria;
    campoCategoria.appendChild(opcao);
  }
  campoCategoria.value = transacao.categoria;
  campoData.value = transacao.data;

  tituloForm.textContent = "Editar lançamento";
  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  renderizarTabela();
  campoDescricao.focus();
  formLancamento.scrollIntoView({ behavior: "smooth", block: "center" });
}

formLancamento.addEventListener("submit", evento => {
  evento.preventDefault();

  const descricaoOk = validarDescricao();
  const valorOk = validarValor();
  const dataOk = validarData();
  if (!descricaoOk || !valorOk || !dataOk) {
    (!descricaoOk ? campoDescricao : !valorOk ? campoValor : campoData).focus();
    return;
  }

  const dados = {
    descricao: campoDescricao.value.trim(),
    valor: Math.round(Number(campoValor.value) * 100) / 100,
    tipo: campoTipo.value === "receita" ? "receita" : "despesa",
    categoria: campoCategoria.value,
    data: campoData.value
  };

  const todas = lerTodasTransacoes();
  if (idEditando) {
    // Só altera se o lançamento for do usuário logado
    const alvo = todas.find(t => t.id === idEditando && t.email === sessaoAtual.email);
    if (alvo) Object.assign(alvo, dados);
  } else {
    todas.push({
      id: gerarId(),
      email: sessaoAtual.email,
      criadoEm: new Date().toISOString(),
      ...dados
    });
  }
  salvarStorage(STORAGE_KEYS.transacoes, todas);

  limparFormulario();
  renderizarTabela();
  document.dispatchEvent(new CustomEvent("transacoes:alteradas"));
});

btnCancelar.addEventListener("click", () => {
  limparFormulario();
  renderizarTabela();
});

campoDescricao.addEventListener("input", () => { if (erroDescricao.textContent) validarDescricao(); });
campoValor.addEventListener("input", () => { if (erroValor.textContent) validarValor(); });
campoData.addEventListener("input", () => { if (erroData.textContent) validarData(); });

// ----- Exclusão com confirmação na própria tela -----
function excluirTransacao(id) {
  const restantes = lerTodasTransacoes()
    .filter(t => !(t.id === id && t.email === sessaoAtual.email));
  salvarStorage(STORAGE_KEYS.transacoes, restantes);
  idExcluindo = null;
  if (idEditando === id) limparFormulario();
  renderizarTabela();
  document.dispatchEvent(new CustomEvent("transacoes:alteradas"));
}

// ----- Tabela -----
function criarBotao(texto, classes, aoClicar, rotulo) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = `btn btn-pequeno ${classes}`;
  botao.textContent = texto;
  if (rotulo) botao.setAttribute("aria-label", rotulo);
  botao.addEventListener("click", aoClicar);
  return botao;
}

function criarCelula(texto, classe) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  if (classe) celula.className = classe;
  return celula;
}

function criarLinha(transacao) {
  const linha = document.createElement("tr");
  if (transacao.id === idEditando) linha.className = "linha-editando";
  if (transacao.id === idExcluindo) linha.className = "linha-excluindo";

  const ehReceita = transacao.tipo === "receita";
  const sinal = ehReceita ? "+ " : "- ";

  linha.appendChild(criarCelula(formatarData(transacao.data)));
  linha.appendChild(criarCelula(transacao.descricao));
  linha.appendChild(criarCelula(transacao.categoria));
  linha.appendChild(criarCelula(ehReceita ? "Receita" : "Despesa", ehReceita ? "receita" : "despesa"));
  linha.appendChild(criarCelula(sinal + formatarMoeda(transacao.valor), `col-valor ${ehReceita ? "receita" : "despesa"}`));

  const celulaAcoes = document.createElement("td");
  celulaAcoes.className = "col-acoes";
  const acoes = document.createElement("div");
  acoes.className = "acoes-linha";

  if (transacao.id === idExcluindo) {
    const aviso = document.createElement("span");
    aviso.className = "texto-confirma";
    aviso.textContent = "Excluir?";
    acoes.appendChild(aviso);
    acoes.appendChild(criarBotao("Sim", "btn-perigo", () => excluirTransacao(transacao.id), `Confirmar exclusão de ${transacao.descricao}`));
    acoes.appendChild(criarBotao("Não", "btn-secundario", () => { idExcluindo = null; renderizarTabela(); }));
  } else {
    acoes.appendChild(criarBotao("Editar", "btn-secundario", () => iniciarEdicao(transacao.id), `Editar ${transacao.descricao}`));
    acoes.appendChild(criarBotao("Excluir", "btn-perigo", () => { idExcluindo = transacao.id; renderizarTabela(); }, `Excluir ${transacao.descricao}`));
  }

  celulaAcoes.appendChild(acoes);
  linha.appendChild(celulaAcoes);
  return linha;
}

function renderizarTabela() {
  const todas = transacoesDoUsuario();
  const lista = aplicarFiltros(todas); // filtros.js: mês/ano, tipo, categoria e busca combinados

  corpoTabela.replaceChildren(...lista.map(criarLinha));
  tabela.hidden = lista.length === 0;
  listaVazia.hidden = lista.length !== 0;
  listaVazia.textContent = todas.length === 0
    ? "Nenhum lançamento ainda. Use o formulário acima para adicionar o primeiro."
    : "Nenhum lançamento encontrado com os filtros escolhidos. Ajuste ou limpe os filtros.";
  contagemLancamentos.textContent = todas.length === 0
    ? ""
    : `Mostrando ${lista.length} de ${textoQuantidade(todas.length)}.`;
}

// Categoria criada ou removida: atualiza o formulário
document.addEventListener("categorias:alteradas", preencherCategorias);

// ----- Início -----
if (sessaoAtual) {
  preencherCategorias();
  limparFormulario();
  renderizarTabela();
}
