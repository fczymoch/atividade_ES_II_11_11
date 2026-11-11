// T6 - L6: senha com menos de 8 caracteres é rejeitada no cadastro
const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { AuthCore, criarCenario } = require("./helpers.js");

const { MENSAGENS } = AuthCore;

const NOVO_USUARIO = { nome: "Carlos", email: "carlos@exemplo.com" };

describe("T6 - senha mínima de 8 caracteres (L6)", () => {
  test("a mensagem de senha curta é a esperada", () => {
    assert.equal(MENSAGENS.senhaCurta, "A senha deve ter no mínimo 8 caracteres.");
  });

  test("senha com menos de 8 caracteres é rejeitada no cadastro", async () => {
    for (const senha of ["1", "abc12", "1234567"]) {
      const { auth, armazenamento } = criarCenario();

      const resultado = await auth.cadastrar({ ...NOVO_USUARIO, senha });

      assert.equal(resultado.ok, false, `deveria rejeitar a senha de ${senha.length} caracteres`);
      assert.equal(resultado.campo, "senha");
      assert.equal(resultado.erro, MENSAGENS.senhaCurta);
      assert.deepEqual(armazenamento.usuariosSalvos(), [], "nenhum usuário deveria ser gravado");
    }
  });

  test("senha com exatamente 8 caracteres é aceita", async () => {
    const { auth, armazenamento } = criarCenario();

    const resultado = await auth.cadastrar({ ...NOVO_USUARIO, senha: "12345678" });

    assert.equal(resultado.ok, true);
    assert.equal(armazenamento.usuariosSalvos().length, 1);
  });

  test("senha com mais de 8 caracteres é aceita", async () => {
    const { auth } = criarCenario();

    const resultado = await auth.cadastrar({ ...NOVO_USUARIO, senha: "senhaforte123" });

    assert.equal(resultado.ok, true);
  });
});
