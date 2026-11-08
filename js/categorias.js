// ===== Categorias (card 06) =====
// Categorias padrão (fixas) + categorias próprias de cada usuário, guardadas em cf_categorias
// como { email, nome, criadoEm }. Depende do app.js e do auth.js (sessaoAtual).
// Avisa as outras telas com o evento "categorias:alteradas" e escuta "transacoes:alteradas".

const CATEGORIAS_PADRAO = [
  "Salário", "Alimentação", "Moradia", "Transporte",
  "Lazer", "Saúde", "Educação", "Outros"
];
const CATEGORIA_PADRAO_FALLBACK = "Outros";
const TAMANHO_MAXIMO_CATEGORIA = 30;

const formCategoria = document.getElementById("form-categoria");
const campoNomeCategoria = document.getElementById("nome-categoria");
const erroNomeCategoria = document.getElementById("erro-nome-categoria");
const mensagemCategoria = document.getElementById("mensagem-categoria");
const listaCategorias = document.getElementById("lista-categorias");

// ----- Dados -----
function lerTodasCategorias() {
  return lerStorage(STORAGE_KEYS.categorias, []);
}

// Padrão primeiro, depois as do usuário em ordem alfabética
function categoriasDoUsuario() {
  const proprias = lerTodasCategorias()
    .filter(c => c.email === sessaoAtual.email)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    .map(c => ({ nome: c.nome, padrao: false }));
  return [...CATEGORIAS_PADRAO.map(nome => ({ nome, padrao: true })), ...proprias];
}

function contarLancamentosDaCategoria(nome) {
  return lerStorage(STORAGE_KEYS.transacoes, [])
    .filter(t => t.email === sessaoAtual.email && t.categoria === nome)
    .length;
}

function avisarCategoriasAlteradas() {
  document.dispatchEvent(new CustomEvent("categorias:alteradas"));
}

// ----- Mensagens -----
function mostrarErroNomeCategoria(texto) {
  erroNomeCategoria.textContent = texto;
  campoNomeCategoria.setAttribute("aria-invalid", texto ? "true" : "false");
}

function mostrarMensagemCategoria(texto) {
  mensagemCategoria.textContent = texto;
  mensagemCategoria.hidden = !texto;
}

// ----- Validação -----
// Retorna o nome já limpo ou null (e mostra o erro) se for inválido
function validarNomeCategoria() {
  const nome = campoNomeCategoria.value.trim().replace(/\s+/g, " ");
  if (!nome) {
    mostrarErroNomeCategoria("Informe o nome da categoria.");
    return null;
  }
  if (nome.length > TAMANHO_MAXIMO_CATEGORIA) {
    mostrarErroNomeCategoria(`Use no máximo ${TAMANHO_MAXIMO_CATEGORIA} caracteres.`);
    return null;
  }
  const jaExiste = categoriasDoUsuario().some(c => normalizarTexto(c.nome) === normalizarTexto(nome));
  if (jaExiste) {
    mostrarErroNomeCategoria("Já existe uma categoria com esse nome.");
    return null;
  }
  mostrarErroNomeCategoria("");
  return nome;
}

// ----- Criar e remover -----
function adicionarCategoria(nome) {
  const todas = lerTodasCategorias();
  todas.push({ email: sessaoAtual.email, nome, criadoEm: new Date().toISOString() });
  salvarStorage(STORAGE_KEYS.categorias, todas);
  renderizarCategorias();
  avisarCategoriasAlteradas();
}

// Categoria com lançamentos não pode ser removida (os lançamentos ficariam sem categoria)
function removerCategoria(nome) {
  const quantidade = contarLancamentosDaCategoria(nome);
  if (quantidade > 0) {
    mostrarMensagemCategoria(
      `Não é possível remover "${nome}": ${quantidade} ${quantidade === 1 ? "lançamento usa" : "lançamentos usam"} ` +
      "esta categoria. Edite ou exclua esses lançamentos antes."
    );
    return;
  }
  const restantes = lerTodasCategorias()
    .filter(c => !(c.email === sessaoAtual.email && c.nome === nome));
  salvarStorage(STORAGE_KEYS.categorias, restantes);
  mostrarMensagemCategoria("");
  renderizarCategorias();
  avisarCategoriasAlteradas();
}

// ----- Lista na tela -----
function criarItemCategoria(categoria) {
  const item = document.createElement("li");
  item.className = "item-categoria";

  const nome = document.createElement("span");
  nome.className = "item-categoria-nome";
  nome.textContent = categoria.nome;
  item.appendChild(nome);

  if (categoria.padrao) {
    const selo = document.createElement("span");
    selo.className = "selo-padrao";
    selo.textContent = "Padrão";
    item.appendChild(selo);
  }

  const quantidade = contarLancamentosDaCategoria(categoria.nome);
  const uso = document.createElement("span");
  uso.className = "item-categoria-uso texto-suave";
  uso.textContent = textoQuantidade(quantidade);
  item.appendChild(uso);

  if (!categoria.padrao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "btn btn-pequeno btn-perigo";
    botao.textContent = "Remover";
    botao.setAttribute("aria-label", `Remover a categoria ${categoria.nome}`);
    botao.addEventListener("click", () => removerCategoria(categoria.nome));
    item.appendChild(botao);
  }
  return item;
}

function renderizarCategorias() {
  listaCategorias.replaceChildren(...categoriasDoUsuario().map(criarItemCategoria));
}

// ----- Eventos -----
formCategoria.addEventListener("submit", evento => {
  evento.preventDefault();
  mostrarMensagemCategoria("");
  const nome = validarNomeCategoria();
  if (!nome) {
    campoNomeCategoria.focus();
    return;
  }
  adicionarCategoria(nome);
  campoNomeCategoria.value = "";
  campoNomeCategoria.focus();
});

campoNomeCategoria.addEventListener("input", () => {
  if (erroNomeCategoria.textContent) validarNomeCategoria();
  mostrarMensagemCategoria("");
});

// A contagem de lançamentos por categoria muda quando o usuário cria/edita/exclui lançamentos
document.addEventListener("transacoes:alteradas", renderizarCategorias);

// ----- Início -----
if (sessaoAtual) {
  renderizarCategorias();
}
