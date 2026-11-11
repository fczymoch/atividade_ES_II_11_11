// ===== Tela de login (card 02) =====

// Se já existe sessão ativa, vai direto para o dashboard
if (obterSessao()) {
  window.location.replace("dashboard.html");
}

const form = document.getElementById("form-login");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const erroEmail = document.getElementById("erro-email");
const erroSenha = document.getElementById("erro-senha");
const mensagemErro = document.getElementById("mensagem-erro");
const btnEntrar = document.getElementById("btn-entrar");
const btnMostrarSenha = document.getElementById("btn-mostrar-senha");

// Regras de login ficam no auth-core.js (testadas com npm test)
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
function validarEmail() {
  const resultado = AuthCore.validarEmail(campoEmail.value);
  mostrarErroCampo(campoEmail, erroEmail, resultado.ok ? "" : resultado.erro);
  return resultado.ok;
}

function validarSenha() {
  if (!campoSenha.value) {
    mostrarErroCampo(campoSenha, erroSenha, "Informe sua senha.");
    return false;
  }
  mostrarErroCampo(campoSenha, erroSenha, "");
  return true;
}

// ----- Eventos -----
form.addEventListener("submit", async evento => {
  evento.preventDefault();
  mostrarErroGeral("");

  const emailOk = validarEmail();
  const senhaOk = validarSenha();
  if (!emailOk || !senhaOk) {
    (emailOk ? campoSenha : campoEmail).focus();
    return;
  }

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  const resultado = await auth.autenticar(campoEmail.value, campoSenha.value);

  if (!resultado.ok) {
    mostrarErroGeral(resultado.erro);
    campoSenha.value = "";
    campoSenha.focus();
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
    return;
  }

  // Nunca guardar a senha na sessão
  const usuario = resultado.usuario;
  salvarStorage(STORAGE_KEYS.sessao, {
    nome: usuario.nome,
    email: usuario.email,
    loginEm: new Date().toISOString()
  });
  window.location.href = "dashboard.html";
});

// Limpa o erro do campo assim que o usuário corrige
campoEmail.addEventListener("input", () => {
  if (erroEmail.textContent) validarEmail();
  mostrarErroGeral("");
});
campoSenha.addEventListener("input", () => {
  if (erroSenha.textContent) validarSenha();
  mostrarErroGeral("");
});

// Mostrar / ocultar senha
btnMostrarSenha.addEventListener("click", () => {
  const visivel = campoSenha.type === "text";
  campoSenha.type = visivel ? "password" : "text";
  btnMostrarSenha.textContent = visivel ? "Mostrar" : "Ocultar";
  btnMostrarSenha.setAttribute("aria-label", visivel ? "Mostrar senha" : "Ocultar senha");
  btnMostrarSenha.setAttribute("aria-pressed", String(!visivel));
});
