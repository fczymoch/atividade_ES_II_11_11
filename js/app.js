// ===== Utilitários compartilhados =====
// Chaves usadas no localStorage (manter iguais em todos os cards)
const STORAGE_KEYS = {
  usuarios: "cf_usuarios",   // lista de usuários cadastrados (card 03)
  sessao: "cf_sessao",       // usuário logado (cards 02 e 04)
  transacoes: "cf_transacoes", // lançamentos por usuário (card 05)
  categorias: "cf_categorias"  // categorias criadas pelos usuários (card 06)
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

// Retorna o usuário logado ({ nome, email, loginEm }) ou null
function obterSessao() {
  return lerStorage(STORAGE_KEYS.sessao, null);
}

// Gera o hash SHA-256 (hexadecimal) de uma senha — usado no login e no cadastro
async function gerarHashSenha(senha) {
  // crypto.subtle só existe em contexto seguro (https, localhost ou arquivo local)
  if (!window.crypto || !window.crypto.subtle) return null;
  const bytes = new TextEncoder().encode(senha);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Texto sem acentos, minúsculo e sem espaços nas pontas — para comparar nomes e fazer buscas
// ("Saúde " -> "saude")
function normalizarTexto(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
