// T5 - L5: após 3 senhas erradas seguidas, a conta fica bloqueada por 10 minutos
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { AuthCore, criarCenario } = require("./helpers.js");

const { MENSAGENS } = AuthCore;
const EMAIL = "ana@exemplo.com";
const SENHA = "senha123";

// Cenário com um usuário já cadastrado
async function cenarioComUsuario() {
  const cenario = criarCenario();
  const cadastro = await cenario.auth.cadastrar({ nome: "Ana", email: EMAIL, senha: SENHA });
  assert.equal(cadastro.ok, true);
  return cenario;
}

async function errar(auth, vezes, email = EMAIL) {
  const resultados = [];
  for (let i = 0; i < vezes; i++) resultados.push(await auth.autenticar(email, "senha-errada"));
  return resultados;
}

describe("T5 - bloqueio após 3 senhas erradas (L5)", () => {
  test("as duas primeiras senhas erradas ainda mostram o erro comum", async () => {
    const { auth } = await cenarioComUsuario();

    const [primeira, segunda] = await errar(auth, 2);

    assert.equal(primeira.erro, MENSAGENS.credenciaisInvalidas);
    assert.equal(primeira.tentativasRestantes, 2);
    assert.equal(segunda.erro, MENSAGENS.credenciaisInvalidas);
    assert.equal(segunda.tentativasRestantes, 1);
    assert.notEqual(primeira.bloqueado, true);
    assert.notEqual(segunda.bloqueado, true);
  });

  test("a 3ª senha errada seguida bloqueia a conta por 10 minutos", async () => {
    const { auth } = await cenarioComUsuario();

    const terceira = (await errar(auth, 3))[2];

    assert.equal(terceira.ok, false);
    assert.equal(terceira.bloqueado, true);
    assert.equal(terceira.restanteMs, 10 * 60 * 1000);
  });

  test("T5: a 4ª tentativa após 3 erros é recusada mesmo com a senha certa", async () => {
    const { auth } = await cenarioComUsuario();
    await errar(auth, 3);

    const quarta = await auth.autenticar(EMAIL, SENHA);

    assert.equal(quarta.ok, false);
    assert.equal(quarta.bloqueado, true);
    assert.equal(quarta.usuario, undefined);
  });

  test("a mensagem informa que a conta está bloqueada temporariamente", async () => {
    const { auth } = await cenarioComUsuario();
    await errar(auth, 3);

    const quarta = await auth.autenticar(EMAIL, SENHA);

    assert.match(quarta.erro, /bloqueada temporariamente/);
    assert.match(quarta.erro, /10 minutos/);
  });

  test("durante o bloqueio o login segue recusado e o tempo restante diminui", async () => {
    const { auth, relogio } = await cenarioComUsuario();
    await errar(auth, 3);

    relogio.avancarMinutos(9);
    const aos9min = await auth.autenticar(EMAIL, SENHA);

    assert.equal(aos9min.bloqueado, true);
    assert.equal(aos9min.restanteMs, 60 * 1000);
    assert.match(aos9min.erro, /1 minuto/);
  });

  test("depois de 10 minutos o login volta a funcionar", async () => {
    const { auth, relogio } = await cenarioComUsuario();
    await errar(auth, 3);

    relogio.avancarMinutos(10);
    const resultado = await auth.autenticar(EMAIL, SENHA);

    assert.equal(resultado.ok, true);
    assert.equal(resultado.usuario.email, EMAIL);
  });

  test("depois do bloqueio o contador recomeça: precisa de 3 novos erros para bloquear de novo", async () => {
    const { auth, relogio } = await cenarioComUsuario();
    await errar(auth, 3);
    relogio.avancarMinutos(10);

    const [primeira, segunda, terceira] = await errar(auth, 3);

    assert.notEqual(primeira.bloqueado, true);
    assert.notEqual(segunda.bloqueado, true);
    assert.equal(terceira.bloqueado, true);
  });

  test("um login com sucesso zera o contador de tentativas", async () => {
    const { auth } = await cenarioComUsuario();
    await errar(auth, 2);

    const sucesso = await auth.autenticar(EMAIL, SENHA);
    assert.equal(sucesso.ok, true);

    // Se o contador não tivesse zerado, o próximo erro seria o 3º e bloquearia
    const [primeira, segunda] = await errar(auth, 2);
    assert.notEqual(primeira.bloqueado, true);
    assert.notEqual(segunda.bloqueado, true);
    assert.equal(primeira.tentativasRestantes, 2);
  });

  test("o bloqueio vale para o e-mail (sem diferenciar maiúsculas) e não afeta outras contas", async () => {
    const { auth } = await cenarioComUsuario();
    await auth.cadastrar({ nome: "Bruno", email: "bruno@exemplo.com", senha: SENHA });

    await errar(auth, 3, "ANA@exemplo.com");

    assert.equal((await auth.autenticar(EMAIL, SENHA)).bloqueado, true);
    assert.equal((await auth.autenticar("bruno@exemplo.com", SENHA)).ok, true);
  });

  test("e-mail que não existe também conta tentativas (não revela quais e-mails têm cadastro)", async () => {
    const { auth } = await cenarioComUsuario();

    const resultados = await errar(auth, 3, "nao-existe@exemplo.com");

    assert.equal(resultados[0].erro, MENSAGENS.credenciaisInvalidas);
    assert.equal(resultados[2].bloqueado, true);
  });

  test("e-mail inválido é recusado pela validação e não conta como tentativa", async () => {
    const { auth } = await cenarioComUsuario();

    for (let i = 0; i < 5; i++) await auth.autenticar("sem-arroba", "qualquer");

    assert.equal((await auth.autenticar(EMAIL, SENHA)).ok, true);
  });

  test("conta bloqueada com senha vazia continua bloqueada (a checagem de bloqueio vem antes da senha vazia)", async () => {
    const { auth } = await cenarioComUsuario();
    await errar(auth, 3);

    const resultado = await auth.autenticar(EMAIL, "");

    assert.equal(resultado.ok, false);
    assert.equal(resultado.bloqueado, true);
    assert.match(resultado.erro, /bloqueada temporariamente/);
  });

  test("senha vazia sem bloqueio é recusada pela validação e não conta como tentativa", async () => {
    const { auth } = await cenarioComUsuario();

    for (let i = 0; i < 5; i++) {
      const resultado = await auth.autenticar(EMAIL, "");
      assert.equal(resultado.campo, "senha");
    }

    assert.equal((await auth.autenticar(EMAIL, SENHA)).ok, true);
  });

  test("login bloqueado não grava sessão, mesmo com a senha certa", async () => {
    const { auth, armazenamento } = await cenarioComUsuario();
    await errar(auth, 3);

    const resultado = await auth.entrar(EMAIL, SENHA);

    assert.equal(resultado.bloqueado, true);
    assert.equal(armazenamento.sessaoSalva(), null);
  });

  test("o estado do bloqueio fica no armazenamento (sobrevive a recarregar a página)", async () => {
    const { auth, armazenamento, relogio } = await cenarioComUsuario();
    await errar(auth, 3);

    // "Nova página": outro serviço de autenticação com o mesmo armazenamento
    const outraPagina = AuthCore.criarAuth({ armazenamento, agora: relogio.agora });

    assert.equal((await outraPagina.autenticar(EMAIL, SENHA)).bloqueado, true);
  });
});
