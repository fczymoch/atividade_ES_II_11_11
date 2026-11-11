// T2 - L2: e-mail e senha corretos retornam sucesso e identificam o usuário
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { AuthCore, criarCenario } = require("./helpers.js");

async function criarCenarioComUsuario() {
  const cenario = criarCenario();
  const cadastro = await cenario.auth.cadastrar({
    nome: "Ana Souza",
    email: "ana@demo.com",
    senha: "senhaforte123"
  });
  assert.equal(cadastro.ok, true);
  return cenario;
}

describe("T2 - login com sucesso (L2)", () => {
  test("e-mail e senha corretos retornam sucesso e identificam o usuário", async () => {
    const { auth } = await criarCenarioComUsuario();

    const resultado = await auth.autenticar("ana@demo.com", "senhaforte123");

    assert.equal(resultado.ok, true);
    assert.deepEqual(resultado.usuario, { nome: "Ana Souza", email: "ana@demo.com" });
  });

  test("o resultado nunca devolve a senha nem o hash", async () => {
    const { auth, armazenamento } = await criarCenarioComUsuario();
    const [guardado] = armazenamento.usuariosSalvos();

    const resultado = await auth.autenticar("ana@demo.com", "senhaforte123");

    assert.equal("senha" in resultado.usuario, false);
    assert.ok(!JSON.stringify(resultado).includes(guardado.senha));
  });

  test("o e-mail não diferencia maiúsculas nem espaços nas pontas", async () => {
    const { auth } = await criarCenarioComUsuario();

    const resultado = await auth.autenticar("  ANA@Demo.com ", "senhaforte123");

    assert.equal(resultado.ok, true);
    assert.equal(resultado.usuario.email, "ana@demo.com");
  });

  test("entra com um usuário que já estava guardado com hash (como os de demonstração)", async () => {
    const hash = await AuthCore.gerarHash("demo123");
    const { auth } = criarCenario([{ nome: "Bruno Lima", email: "bruno@demo.com", senha: hash }]);

    const resultado = await auth.autenticar("bruno@demo.com", "demo123");

    assert.equal(resultado.ok, true);
    assert.equal(resultado.usuario.nome, "Bruno Lima");
  });
});
