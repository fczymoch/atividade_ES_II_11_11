// ===== Regras de login e cadastro (independentes da tela) =====
// Usado pelo navegador (login.js e cadastro.js) e pelos testes automatizados (npm test).
// Nada aqui mexe no HTML: quem chama decide como mostrar mensagens e para onde ir.
//
// Comportamentos da Sprint 1:
//   L1 cadastro com senha em hash      L2 login com sucesso       L3 erro genérico no login
//   L4 validação de e-mail             L5 bloqueio após 3 erros   L6 senha mínima
(function (raiz) {
  "use strict";

  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TAMANHO_MINIMO_SENHA = 8;
  const MAX_TENTATIVAS_LOGIN = 3;                  // L5: senhas erradas seguidas até bloquear
  const DURACAO_BLOQUEIO_MS = 10 * 60 * 1000;      // L5: 10 minutos

  const MENSAGENS = {
    emailVazio: "Informe seu e-mail.",
    emailInvalido: "Informe um e-mail válido (ex.: voce@exemplo.com).",
    nomeVazio: "Informe seu nome.",
    senhaVazia: "Informe sua senha.",
    senhaCurta: `A senha deve ter no mínimo ${TAMANHO_MINIMO_SENHA} caracteres.`,
    emailJaCadastrado: "Este e-mail já está cadastrado.",
    semCriptografia: "Não foi possível criar a conta: este navegador não oferece criptografia segura (crypto.subtle). Abra o sistema por https ou localhost.",
    credenciaisInvalidas: "E-mail ou senha incorretos. Confira os dados e tente novamente.",
    contaBloqueada: "Conta bloqueada temporariamente por excesso de tentativas com senha incorreta."
  };

  // ----- L5: texto do bloqueio ("10 minutos", "1 minuto", "45 segundos") -----
  function formatarTempoRestante(ms) {
    const segundos = Math.ceil(ms / 1000);
    if (segundos < 60) return `${segundos} ${segundos === 1 ? "segundo" : "segundos"}`;
    const minutos = Math.ceil(segundos / 60);
    return `${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;
  }

  function mensagemContaBloqueada(restanteMs) {
    return `${MENSAGENS.contaBloqueada} Tente novamente em ${formatarTempoRestante(restanteMs)}.`;
  }

  // ----- L4: validação de e-mail (não consulta nenhum dado) -----
  function validarEmail(email) {
    const valor = String(email ?? "").trim();
    if (!valor) return { ok: false, erro: MENSAGENS.emailVazio };
    if (!REGEX_EMAIL.test(valor)) return { ok: false, erro: MENSAGENS.emailInvalido };
    return { ok: true, email: valor };
  }

  function validarSenhaCadastro(senha) {
    const valor = String(senha ?? "");
    if (!valor) return { ok: false, erro: MENSAGENS.senhaVazia };
    if (valor.length < TAMANHO_MINIMO_SENHA) return { ok: false, erro: MENSAGENS.senhaCurta };
    return { ok: true };
  }

  // ----- Hash SHA-256 (navegador ou Node) -----
  function obterSubtle() {
    if (raiz.crypto && raiz.crypto.subtle) return raiz.crypto.subtle;
    if (typeof require === "function") {
      try { return require("node:crypto").webcrypto.subtle; } catch { /* sem crypto */ }
    }
    return null;
  }

  async function gerarHash(senha) {
    const subtle = obterSubtle();
    if (!subtle) return null;
    const bytes = new TextEncoder().encode(senha);
    const hash = await subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function mesmoEmail(a, b) {
    return String(a).toLowerCase() === String(b).toLowerCase();
  }

  // ----- Serviço de autenticação -----
  // armazenamento: objeto com lerUsuarios() e salvarUsuarios(lista) e, para o bloqueio (L5),
  //   lerTentativas() e salvarTentativas(objeto). Sem elas, as tentativas ficam só em memória.
  //   No navegador: criarArmazenamentoLocal(); nos testes: um armazenamento em memória.
  // agora: função que devolve o horário atual em ms (trocável nos testes de tempo).
  function criarAuth({ armazenamento, agora = () => Date.now(), hash = gerarHash } = {}) {
    if (!armazenamento) throw new Error("criarAuth precisa de um armazenamento");

    // ----- L5: bloqueio após 3 senhas erradas seguidas -----
    // Por e-mail (em minúsculas): { falhas, bloqueadoAte /* ms; 0 = sem bloqueio */ }
    let tentativasEmMemoria = {};
    const lerTentativas = () => (typeof armazenamento.lerTentativas === "function"
      ? armazenamento.lerTentativas()
      : tentativasEmMemoria);
    const salvarTentativas = objeto => {
      if (typeof armazenamento.salvarTentativas === "function") armazenamento.salvarTentativas(objeto);
      else tentativasEmMemoria = objeto;
    };

    // Milissegundos que faltam para o bloqueio acabar (0 = não bloqueado).
    // Bloqueio vencido é descartado: o contador volta a zero.
    function restanteBloqueio(email) {
      const todas = lerTentativas();
      const chave = email.toLowerCase();
      const registro = todas[chave];
      if (!registro || !registro.bloqueadoAte) return 0;

      const restante = registro.bloqueadoAte - agora();
      if (restante <= 0) {
        delete todas[chave];
        salvarTentativas(todas);
        return 0;
      }
      return restante;
    }

    function registrarFalha(email) {
      const todas = lerTentativas();
      const chave = email.toLowerCase();
      const falhas = ((todas[chave] && todas[chave].falhas) || 0) + 1;

      if (falhas >= MAX_TENTATIVAS_LOGIN) {
        todas[chave] = { falhas, bloqueadoAte: agora() + DURACAO_BLOQUEIO_MS };
        salvarTentativas(todas);
        return { bloqueado: true, restanteMs: DURACAO_BLOQUEIO_MS };
      }
      todas[chave] = { falhas, bloqueadoAte: 0 };
      salvarTentativas(todas);
      return { bloqueado: false, tentativasRestantes: MAX_TENTATIVAS_LOGIN - falhas };
    }

    function zerarTentativas(email) {
      const todas = lerTentativas();
      if (todas[email.toLowerCase()]) {
        delete todas[email.toLowerCase()];
        salvarTentativas(todas);
      }
    }

    const respostaBloqueada = restanteMs => ({
      ok: false,
      bloqueado: true,
      restanteMs,
      erro: mensagemContaBloqueada(restanteMs)
    });

    async function cadastrar({ nome, email, senha } = {}) {
      // L4: o e-mail é validado antes de qualquer consulta aos usuários
      const validacaoEmail = validarEmail(email);
      if (!validacaoEmail.ok) return { ok: false, campo: "email", erro: validacaoEmail.erro };

      const nomeLimpo = String(nome ?? "").trim();
      if (!nomeLimpo) return { ok: false, campo: "nome", erro: MENSAGENS.nomeVazio };

      const validacaoSenha = validarSenhaCadastro(senha);
      if (!validacaoSenha.ok) return { ok: false, campo: "senha", erro: validacaoSenha.erro };

      const usuarios = armazenamento.lerUsuarios();
      if (usuarios.some(u => mesmoEmail(u.email, validacaoEmail.email))) {
        return { ok: false, campo: "email", erro: MENSAGENS.emailJaCadastrado };
      }

      // L1: a senha só é gravada como hash SHA-256. Sem crypto.subtle o cadastro é recusado
      // (não existe mais o fallback que gravava a senha em texto puro).
      const senhaHash = await hash(senha);
      if (senhaHash === null) return { ok: false, campo: "senha", erro: MENSAGENS.semCriptografia };

      const usuario = {
        nome: nomeLimpo,
        email: validacaoEmail.email,
        senha: senhaHash,
        criadoEm: new Date(agora()).toISOString()
      };
      armazenamento.salvarUsuarios([...usuarios, usuario]);
      return { ok: true, usuario: { nome: usuario.nome, email: usuario.email } };
    }

    async function autenticar(email, senha) {
      // L4: o e-mail é validado antes de qualquer consulta aos usuários
      const validacaoEmail = validarEmail(email);
      if (!validacaoEmail.ok) return { ok: false, campo: "email", erro: validacaoEmail.erro };

      // L5: conta bloqueada recusa o login mesmo com a senha certa (a senha nem é conferida)
      const restante = restanteBloqueio(validacaoEmail.email);
      if (restante > 0) return respostaBloqueada(restante);

      if (!senha) return { ok: false, campo: "senha", erro: MENSAGENS.senhaVazia };

      const usuarios = armazenamento.lerUsuarios();
      const usuario = usuarios.find(u => mesmoEmail(u.email, validacaoEmail.email));

      // L3: a mesma mensagem para e-mail inexistente e senha errada.
      // L5: os dois casos contam como tentativa errada (não revela quais e-mails existem).
      const falhaDeLogin = () => {
        const estado = registrarFalha(validacaoEmail.email);
        if (estado.bloqueado) return respostaBloqueada(estado.restanteMs);
        return { ok: false, erro: MENSAGENS.credenciaisInvalidas, tentativasRestantes: estado.tentativasRestantes };
      };

      if (!usuario) return falhaDeLogin();
      // Compara hash com hash; o texto digitado só é comparado direto se não houver hash
      // disponível (assim ninguém entra digitando o próprio hash guardado).
      const hashDigitado = await hash(senha);
      const senhaConfere = hashDigitado !== null ? usuario.senha === hashDigitado : usuario.senha === senha;
      if (!senhaConfere) return falhaDeLogin();

      // L5: login com sucesso zera o contador de tentativas erradas
      zerarTentativas(validacaoEmail.email);

      // L2: sucesso identifica o usuário (nunca devolve a senha)
      return { ok: true, usuario: { nome: usuario.nome, email: usuario.email } };
    }

    return { cadastrar, autenticar };
  }

  // Armazenamento do navegador (localStorage: cf_usuarios e cf_tentativas)
  function criarArmazenamentoLocal(chave = "cf_usuarios", chaveTentativas = "cf_tentativas") {
    return {
      lerUsuarios() {
        try {
          return JSON.parse(localStorage.getItem(chave)) || [];
        } catch {
          return [];
        }
      },
      salvarUsuarios(lista) {
        localStorage.setItem(chave, JSON.stringify(lista));
      },
      lerTentativas() {
        try {
          return JSON.parse(localStorage.getItem(chaveTentativas)) || {};
        } catch {
          return {};
        }
      },
      salvarTentativas(objeto) {
        localStorage.setItem(chaveTentativas, JSON.stringify(objeto));
      }
    };
  }

  const AuthCore = {
    MENSAGENS,
    TAMANHO_MINIMO_SENHA,
    MAX_TENTATIVAS_LOGIN,
    DURACAO_BLOQUEIO_MS,
    formatarTempoRestante,
    mensagemContaBloqueada,
    validarEmail,
    validarSenhaCadastro,
    gerarHash,
    criarAuth,
    criarArmazenamentoLocal
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AuthCore; // Node (testes)
  } else {
    raiz.AuthCore = AuthCore;  // navegador
  }
})(typeof window !== "undefined" ? window : globalThis);
