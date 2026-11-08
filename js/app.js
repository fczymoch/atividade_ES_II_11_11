// ===== Utilitários compartilhados =====
// Chaves usadas no localStorage (manter iguais em todos os cards)
const STORAGE_KEYS = {
  usuarios: "cf_usuarios",   // lista de usuários cadastrados (card 03)
  sessao: "cf_sessao",       // usuário logado (cards 02 e 04)
  transacoes: "cf_transacoes" // lançamentos por usuário (card 05)
};

// Formata número como moeda brasileira: 1234.5 -> "R$ 1.234,50"
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Formata data ISO (AAAA-MM-DD) no padrão brasileiro: "2026-11-08" -> "08/11/2026"
function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Lê um JSON do localStorage com valor padrão
function lerStorage(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : padrao;
  } catch {
    return padrao;
  }
}

// Grava um valor como JSON no localStorage
function salvarStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}
