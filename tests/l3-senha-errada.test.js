// T3 - L3: senha errada retorna erro sem dizer se foi o e-mail ou a senha que falhou
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { AuthCore, criarCenario } = require("./helpers.js");

const { MENSAGENS } = AuthCore;

async function criarCenarioComUsuario() {
  const cenario = criarCenario();
  await cenario.auth.cadastrar({ nome: "Ana Souza", email: "ana@demo.com", senha: "senhaforte123" });
  return cenario;
}

describe("T3 - senha errada (L3)", () => {
  test("senha errada retorna erro", async () => {
    const { auth } = await criarCenarioComUsuario();

    const resultado = await auth.autenticar("ana@demo.com", "senha-errada");

    assert.equal(resultado.ok, false);
    assert.equal(resultado.erro, MENSAGENS.credenciaisInvalidas);
    assert.equal(resultado.usuario, undefined);
  });

  test("e-mail inexistente e senha errada dão exatamente o mesmo erro", async () => {
    const { auth } = await criarCenarioComUsuario();

    const senhaErrada = await auth.autenticar("ana@demo.com", "senha-errada");
    const emailInexistente = await auth.autenticar("ninguem@demo.com", "senhaforte123");

    assert.deepEqual(emailInexistente, senhaErrada);
  });

  test("a mensagem não aponta qual dos dois campos falhou", () => {
    assert.match(MENSAGENS.credenciaisInvalidas, /e-mail ou senha/i);
  });

  test("digitar o próprio hash guardado como senha não autentica", async () => {
    const { auth, armazenamento } = await criarCenarioComUsuario();
    const [guardado] = armazenamento.usuariosSalvos();

    const resultado = await auth.autenticar("ana@demo.com", guardado.senha);

    assert.equal(resultado.ok, false);
  });

  test("senha errada não altera os usuários guardados", async () => {
    const { auth, armazenamento } = await criarCenarioComUsuario();
    const antes = armazenamento.usuariosSalvos();

    await auth.autenticar("ana@demo.com", "senha-errada");

    assert.deepEqual(armazenamento.usuariosSalvos(), antes);
  });
});
