// ===== Tela de cadastro (card 03) =====

// Quem já está logado não precisa se cadastrar
if (obterSessao()) {
  window.location.replace("dashboard.html");
}

const form = document.getElementById("form-cadastro");
const campoNome = document.getElementById("nome");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const campoConfirmar = document.getElementById("confirmar-senha");
const erroNome = document.getElementById("erro-nome");
const erroEmail = document.getElementById("erro-email");
const erroSenha = document.getElementById("erro-senha");
const erroConfirmar = document.getElementById("erro-confirmar-senha");
const mensagemErro = document.getElementById("mensagem-erro");
const mensagemSucesso = document.getElementById("mensagem-sucesso");
const btnCadastrar = document.getElementById("btn-cadastrar");
const btnMostrarSenha = document.getElementById("btn-mostrar-senha");

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MINIMO_SENHA = 6;
const TEMPO_REDIRECIONAMENTO_MS = 1500;

// ----- Mensagens -----
function mostrarErroCampo(campo, elementoErro, texto) {
  elementoErro.textContent = texto;
  campo.setAttribute("aria-invalid", texto ? "true" : "false");
}

function mostrarErroGeral(texto) {
  mensagemErro.textContent = texto;
  mensagemErro.hidden = !texto;
}

// ----- Validação dos campos -----
function validarNome() {
  if (!campoNome.value.trim()) {
    mostrarErroCampo(campoNome, erroNome, "Informe seu nome.");
    return false;
  }
  mostrarErroCampo(campoNome, erroNome, "");
  return true;
}

function validarEmail() {
  const email = campoEmail.value.trim();
  if (!email) {
    mostrarErroCampo(campoEmail, erroEmail, "Informe seu e-mail.");
    return false;
  }
  if (!REGEX_EMAIL.test(email)) {
    mostrarErroCampo(campoEmail, erroEmail, "Informe um e-mail válido (ex.: voce@exemplo.com).");
    return false;
  }
  mostrarErroCampo(campoEmail, erroEmail, "");
  return true;
}

function validarSenha() {
  if (!campoSenha.value) {
    mostrarErroCampo(campoSenha, erroSenha, "Informe uma senha.");
    return false;
  }
  if (campoSenha.value.length < TAMANHO_MINIMO_SENHA) {
    mostrarErroCampo(campoSenha, erroSenha, `A senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`);
    return false;
  }
  mostrarErroCampo(campoSenha, erroSenha, "");
  return true;
}

function validarConfirmacao() {
  if (!campoConfirmar.value) {
    mostrarErroCampo(campoConfirmar, erroConfirmar, "Confirme sua senha.");
    return false;
  }
  if (campoConfirmar.value !== campoSenha.value) {
    mostrarErroCampo(campoConfirmar, erroConfirmar, "As senhas não são iguais.");
    return false;
  }
  mostrarErroCampo(campoConfirmar, erroConfirmar, "");
  return true;
}

// ----- Regras de negócio -----
function emailJaCadastrado(email) {
  const usuarios = lerStorage(STORAGE_KEYS.usuarios, []);
  return usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
}

async function salvarUsuario(nome, email, senha) {
  const usuarios = lerStorage(STORAGE_KEYS.usuarios, []);
  // Bônus: guarda hash SHA-256. Se crypto.subtle não existir, mantém a senha em texto
  // (o login do card 02 aceita os dois formatos).
  const senhaGuardada = (await gerarHashSenha(senha)) ?? senha;
  usuarios.push({
    nome,
    email,
    senha: senhaGuardada,
    criadoEm: new Date().toISOString()
  });
  salvarStorage(STORAGE_KEYS.usuarios, usuarios);
}

// ----- Eventos -----
form.addEventListener("submit", async evento => {
  evento.preventDefault();
  mostrarErroGeral("");

  const resultados = [validarNome(), validarEmail(), validarSenha(), validarConfirmacao()];
  const campos = [campoNome, campoEmail, campoSenha, campoConfirmar];
  const primeiroInvalido = resultados.indexOf(false);
  if (primeiroInvalido !== -1) {
    campos[primeiroInvalido].focus();
    return;
  }

  const nome = campoNome.value.trim();
  const email = campoEmail.value.trim();

  if (emailJaCadastrado(email)) {
    mostrarErroCampo(campoEmail, erroEmail, "Este e-mail já está cadastrado.");
    mostrarErroGeral("Já existe uma conta com este e-mail. Use outro e-mail ou entre na sua conta.");
    campoEmail.focus();
    return;
  }

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = "Cadastrando...";

  try {
    await salvarUsuario(nome, email, campoSenha.value);
  } catch {
    mostrarErroGeral("Não foi possível salvar o cadastro. Tente novamente.");
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Cadastrar";
    return;
  }

  mensagemSucesso.textContent = "Cadastro realizado com sucesso! Redirecionando para o login...";
  mensagemSucesso.hidden = false;
  setTimeout(() => {
    window.location.href = "index.html";
  }, TEMPO_REDIRECIONAMENTO_MS);
});

// Revalida o campo assim que o usuário corrige
campoNome.addEventListener("input", () => {
  if (erroNome.textContent) validarNome();
});
campoEmail.addEventListener("input", () => {
  if (erroEmail.textContent) validarEmail();
  mostrarErroGeral("");
});
campoSenha.addEventListener("input", () => {
  if (erroSenha.textContent) validarSenha();
  if (campoConfirmar.value) validarConfirmacao();
});
campoConfirmar.addEventListener("input", () => {
  if (erroConfirmar.textContent) validarConfirmacao();
});

// Mostrar / ocultar senha (afeta os dois campos de senha)
btnMostrarSenha.addEventListener("click", () => {
  const visivel = campoSenha.type === "text";
  const novoTipo = visivel ? "password" : "text";
  campoSenha.type = novoTipo;
  campoConfirmar.type = novoTipo;
  btnMostrarSenha.textContent = visivel ? "Mostrar" : "Ocultar";
  btnMostrarSenha.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
  btnMostrarSenha.setAttribute("aria-pressed", String(!visivel));
});
