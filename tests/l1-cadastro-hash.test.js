// T1 - L1: cadastro válido grava uma senha diferente da digitada (hash SHA-256)
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { AuthCore, criarCenario, criarArmazenamentoMemoria } = require("./helpers.js");

const { MENSAGENS } = AuthCore;

const NOVO_USUARIO = { nome: "Carlos", email: "carlos@exemplo.com", senha: "senhaforte123" };

describe("T1 - cadastro com senha em hash (L1)", () => {
  test("e-mail e senha válidos criam o usuário", async () => {
    const { auth, armazenamento } = criarCenario();

    const resultado = await auth.cadastrar(NOVO_USUARIO);

    assert.equal(resultado.ok, true);
    assert.equal(armazenamento.usuariosSalvos().length, 1);
    assert.equal(armazenamento.usuariosSalvos()[0].email, NOVO_USUARIO.email);
  });

  test("a senha gravada é diferente da digitada", async () => {
    const { auth, armazenamento } = criarCenario();

    await auth.cadastrar(NOVO_USUARIO);

    const [usuario] = armazenamento.usuariosSalvos();
    assert.notEqual(usuario.senha, NOVO_USUARIO.senha);
  });

  test("a senha gravada é o SHA-256 da senha digitada", async () => {
    const { auth, armazenamento } = criarCenario();

    await auth.cadastrar(NOVO_USUARIO);

    const [usuario] = armazenamento.usuariosSalvos();
    const esperado = createHash("sha256").update(NOVO_USUARIO.senha).digest("hex");
    assert.match(usuario.senha, /^[0-9a-f]{64}$/);
    assert.equal(usuario.senha, esperado);
  });

  test("a senha em texto puro não aparece em nenhum lugar do que foi gravado", async () => {
    const { auth, armazenamento } = criarCenario();

    await auth.cadastrar(NOVO_USUARIO);

    const gravado = JSON.stringify(armazenamento.usuariosSalvos());
    assert.equal(gravado.includes(NOVO_USUARIO.senha), false);
  });

  test("sem crypto.subtle o cadastro é recusado e nada é gravado", async () => {
    const armazenamento = criarArmazenamentoMemoria();
    const semCripto = async () => null; // simula navegador sem crypto.subtle
    const auth = AuthCore.criarAuth({ armazenamento, hash: semCripto });

    const resultado = await auth.cadastrar(NOVO_USUARIO);

    assert.equal(resultado.ok, false);
    assert.equal(resultado.erro, MENSAGENS.semCriptografia);
    assert.deepEqual(armazenamento.usuariosSalvos(), []);
  });

  test("se o hash não vier no formato SHA-256, o cadastro é recusado e nada é gravado", async () => {
    const armazenamento = criarArmazenamentoMemoria();
    const hashQueDevolveTextoPuro = async senha => senha; // simula um hash quebrado
    const auth = AuthCore.criarAuth({ armazenamento, hash: hashQueDevolveTextoPuro });

    const resultado = await auth.cadastrar(NOVO_USUARIO);

    assert.equal(resultado.ok, false);
    assert.deepEqual(armazenamento.usuariosSalvos(), []);
  });

  test("e-mail já cadastrado é recusado (sem diferenciar maiúsculas)", async () => {
    const { auth, armazenamento } = criarCenario();
    await auth.cadastrar(NOVO_USUARIO);

    const resultado = await auth.cadastrar({ ...NOVO_USUARIO, nome: "Outro", email: "CARLOS@exemplo.com" });

    assert.equal(resultado.ok, false);
    assert.equal(resultado.erro, MENSAGENS.emailJaCadastrado);
    assert.equal(armazenamento.usuariosSalvos().length, 1);
  });
});
