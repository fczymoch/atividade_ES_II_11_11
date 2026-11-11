// T4 - L4: e-mail vazio ou sem @ é rejeitado antes de consultar os usuários
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { AuthCore, criarCenario } = require("./helpers.js");

const { MENSAGENS } = AuthCore;

describe("T4 - validação de e-mail (L4)", () => {
  test("e-mail vazio é rejeitado", () => {
    for (const email of ["", "   ", undefined, null]) {
      const resultado = AuthCore.validarEmail(email);
      assert.equal(resultado.ok, false, `deveria rejeitar ${JSON.stringify(email)}`);
      assert.equal(resultado.erro, MENSAGENS.emailVazio);
    }
  });

  test("e-mail sem @ é rejeitado", () => {
    for (const email of ["felipe.exemplo.com", "felipe", "felipe#exemplo.com"]) {
      const resultado = AuthCore.validarEmail(email);
      assert.equal(resultado.ok, false, `deveria rejeitar "${email}"`);
      assert.equal(resultado.erro, MENSAGENS.emailInvalido);
    }
  });

  test("e-mail com formato válido é aceito (sem espaços nas pontas)", () => {
    const resultado = AuthCore.validarEmail("  felipe@exemplo.com ");
    assert.equal(resultado.ok, true);
    assert.equal(resultado.email, "felipe@exemplo.com");
  });

  test("login com e-mail inválido é recusado sem consultar os usuários", async () => {
    const { auth, armazenamento } = criarCenario();

    for (const email of ["", "sem-arroba.com"]) {
      const resultado = await auth.autenticar(email, "qualquer-senha");
      assert.equal(resultado.ok, false);
      assert.equal(resultado.campo, "email");
    }
    assert.equal(armazenamento.leituras, 0, "o armazenamento não deveria ter sido consultado");
  });

  test("cadastro com e-mail inválido é recusado sem consultar nem gravar usuários", async () => {
    const { auth, armazenamento } = criarCenario();

    const resultado = await auth.cadastrar({ nome: "Felipe", email: "sem-arroba.com", senha: "senhaforte123" });

    assert.equal(resultado.ok, false);
    assert.equal(resultado.erro, MENSAGENS.emailInvalido);
    assert.equal(armazenamento.leituras, 0, "o armazenamento não deveria ter sido consultado");
    assert.deepEqual(armazenamento.usuariosSalvos(), []);
  });
});
