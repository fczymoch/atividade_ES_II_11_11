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

const TEMPO_REDIRECIONAMENTO_MS = 1500;

// Regras de cadastro ficam no auth-core.js (testadas com npm test)
const auth = AuthCore.criarAuth({ armazenamento: AuthCore.criarArmazenamentoLocal(STORAGE_KEYS.usuarios) });

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
  const resultado = AuthCore.validarEmail(campoEmail.value);
  mostrarErroCampo(campoEmail, erroEmail, resultado.ok ? "" : resultado.erro);
  return resultado.ok;
}

function validarSenha() {
  const resultado = AuthCore.validarSenhaCadastro(campoSenha.value);
  mostrarErroCampo(campoSenha, erroSenha, resultado.ok ? "" : resultado.erro);
  return resultado.ok;
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

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = "Cadastrando...";

  let resultado;
  try {
    resultado = await auth.cadastrar({
      nome: campoNome.value,
      email: campoEmail.value,
      senha: campoSenha.value
    });
  } catch {
    resultado = { ok: false, erro: "Não foi possível salvar o cadastro. Tente novamente." };
  }

  if (!resultado.ok) {
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = "Cadastrar";
    if (resultado.erro === AuthCore.MENSAGENS.emailJaCadastrado) {
      mostrarErroCampo(campoEmail, erroEmail, resultado.erro);
      mostrarErroGeral("Já existe uma conta com este e-mail. Use outro e-mail ou entre na sua conta.");
      campoEmail.focus();
    } else {
      mostrarErroGeral(resultado.erro);
    }
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
