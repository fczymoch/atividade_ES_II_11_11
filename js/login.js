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

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    mostrarErroCampo(campoSenha, erroSenha, "Informe sua senha.");
    return false;
  }
  mostrarErroCampo(campoSenha, erroSenha, "");
  return true;
}

// ----- Conferência das credenciais -----
// Aceita senha guardada em texto ou como hash SHA-256 (bônus do card 03)
async function senhaConfere(senhaDigitada, senhaGuardada) {
  if (senhaDigitada === senhaGuardada) return true;
  return (await gerarHashSenha(senhaDigitada)) === senhaGuardada;
}

async function autenticar(email, senha) {
  const usuarios = lerStorage(STORAGE_KEYS.usuarios, []);
  const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!usuario) return null;
  return (await senhaConfere(senha, usuario.senha)) ? usuario : null;
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

  const usuario = await autenticar(campoEmail.value.trim(), campoSenha.value);

  if (!usuario) {
    mostrarErroGeral("E-mail ou senha incorretos. Confira os dados e tente novamente.");
    campoSenha.value = "";
    campoSenha.focus();
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
    return;
  }

  // Nunca guardar a senha na sessão
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
