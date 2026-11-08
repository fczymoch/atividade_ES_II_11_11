// ===== Carga de dados de demonstração (card 09) =====
// Cria usuários de teste e lançamentos de exemplo dos últimos 3 meses,
// para o site já ter dados ao ser aberto pela primeira vez.
// Não apaga nada que o usuário tenha cadastrado.

const SEED_VERSAO = "1";
const SEED_CHAVE = "cf_seed_versao";

// Senha de todos os usuários de teste: demo123 (guardada como hash SHA-256)
const SENHA_DEMO = "demo123";
const HASH_SENHA_DEMO = "d3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791";

const USUARIOS_DEMO = [
  { nome: "Ana Souza",     email: "ana@demo.com",   fator: 1 },
  { nome: "Bruno Lima",    email: "bruno@demo.com", fator: 1.6 },
  { nome: "Carla Mendes",  email: "carla@demo.com", fator: 0.7 }
];

// Modelo de um mês: [dia, descrição, valor base, tipo, categoria]
const MODELO_MES = [
  [5,  "Salário",                 4500.00, "receita", "Salário"],
  [12, "Freelance",                650.00, "receita", "Outros"],
  [10, "Aluguel",                 1400.00, "despesa", "Moradia"],
  [10, "Conta de luz",             180.35, "despesa", "Moradia"],
  [15, "Internet",                  99.90, "despesa", "Moradia"],
  [7,  "Supermercado",             520.40, "despesa", "Alimentação"],
  [21, "Supermercado",             310.75, "despesa", "Alimentação"],
  [18, "Restaurante",              145.00, "despesa", "Alimentação"],
  [8,  "Combustível",              250.00, "despesa", "Transporte"],
  [22, "Aplicativo de transporte",  62.80, "despesa", "Transporte"],
  [25, "Cinema",                    78.00, "despesa", "Lazer"],
  [14, "Farmácia",                  89.90, "despesa", "Saúde"],
  [20, "Curso online",             129.00, "despesa", "Educação"]
];

// Data local no formato AAAA-MM-DD (o app exibe como DD/MM/AAAA)
function dataISO(ano, mesIndice, dia) {
  const d = new Date(ano, mesIndice, dia);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

// Gera os lançamentos de um usuário para o mês atual e os 2 anteriores
function gerarTransacoes(usuario) {
  const hoje = new Date();
  const lista = [];
  let n = 0;

  for (let volta = 2; volta >= 0; volta--) {
    const ref = new Date(hoje.getFullYear(), hoje.getMonth() - volta, 1);
    // pequena variação mês a mês para os gráficos não ficarem iguais
    const variacao = 1 + ((volta * 7) % 10) / 100;

    for (const [dia, descricao, valorBase, tipo, categoria] of MODELO_MES) {
      // no mês atual, só entram os lançamentos até hoje
      if (volta === 0 && dia > hoje.getDate()) continue;

      const multiplicador = tipo === "receita" ? usuario.fator : usuario.fator * variacao;
      lista.push({
        id: `demo-${usuario.email}-${++n}`,
        email: usuario.email,
        descricao,
        valor: Math.round(valorBase * multiplicador * 100) / 100,
        tipo,
        categoria,
        data: dataISO(ref.getFullYear(), ref.getMonth(), dia),
        // usado pelo card 05 para desempatar a ordenação de lançamentos do mesmo dia
        criadoEm: new Date(ref.getFullYear(), ref.getMonth(), dia, 12, 0, n).toISOString(),
        demo: true
      });
    }
  }
  return lista;
}

// Inclui os usuários de teste que ainda não existem e os lançamentos deles
function carregarDadosDemo() {
  const usuarios = lerStorage(STORAGE_KEYS.usuarios, []);
  const transacoes = lerStorage(STORAGE_KEYS.transacoes, []);

  for (const demo of USUARIOS_DEMO) {
    const existe = usuarios.some(u => u.email.toLowerCase() === demo.email);
    if (!existe) {
      usuarios.push({
        nome: demo.nome,
        email: demo.email,
        senha: HASH_SENHA_DEMO,
        criadoEm: new Date().toISOString(),
        demo: true
      });
    }
    const temLancamentos = transacoes.some(t => t.email === demo.email);
    if (!temLancamentos) transacoes.push(...gerarTransacoes(demo));
  }

  salvarStorage(STORAGE_KEYS.usuarios, usuarios);
  salvarStorage(STORAGE_KEYS.transacoes, transacoes);
  localStorage.setItem(SEED_CHAVE, SEED_VERSAO);
}

// Apaga só os dados de demonstração e cria tudo de novo
// (os usuários cadastrados pelo site e os lançamentos deles são mantidos)
function restaurarDadosDemo() {
  const emailsDemo = USUARIOS_DEMO.map(u => u.email);
  const usuarios = lerStorage(STORAGE_KEYS.usuarios, []).filter(u => !emailsDemo.includes(u.email));
  const transacoes = lerStorage(STORAGE_KEYS.transacoes, []).filter(t => !emailsDemo.includes(t.email));
  salvarStorage(STORAGE_KEYS.usuarios, usuarios);
  salvarStorage(STORAGE_KEYS.transacoes, transacoes);
  carregarDadosDemo();
}

// Roda uma vez por versão da carga
if (localStorage.getItem(SEED_CHAVE) !== SEED_VERSAO) {
  carregarDadosDemo();
}

// ----- Painel "Usuários de teste" na tela de login -----
function montarPainelDemo() {
  const form = document.getElementById("form-login");
  const rodape = document.querySelector(".auth-rodape");
  if (!form || !rodape) return;

  const painel = document.createElement("details");
  painel.className = "painel-demo";
  painel.innerHTML = `
    <summary>Usuários de teste</summary>
    <p>Senha de todos: <code>${SENHA_DEMO}</code>. Clique para preencher:</p>
    <ul>
      ${USUARIOS_DEMO.map(u => `
        <li><button type="button" class="btn-demo" data-email="${u.email}">
          <strong>${u.nome}</strong><span>${u.email}</span>
        </button></li>`).join("")}
    </ul>
    <button type="button" id="btn-restaurar-demo" class="btn-link">Restaurar dados de demonstração</button>
    <small id="msg-restaurar" class="painel-demo-msg" role="status"></small>
  `;
  rodape.after(painel);

  painel.querySelectorAll(".btn-demo").forEach(botao => {
    botao.addEventListener("click", () => {
      document.getElementById("email").value = botao.dataset.email;
      document.getElementById("senha").value = SENHA_DEMO;
      document.getElementById("btn-entrar").focus();
    });
  });

  document.getElementById("btn-restaurar-demo").addEventListener("click", () => {
    restaurarDadosDemo();
    document.getElementById("msg-restaurar").textContent = "Dados de demonstração restaurados.";
  });
}

document.addEventListener("DOMContentLoaded", montarPainelDemo);
