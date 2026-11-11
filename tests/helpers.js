// Utilitários compartilhados pelos testes.
// Arquivo sem ".test" no nome: o "npm test" não executa ele sozinho.
const AuthCore = require("../js/auth-core.js");

// Armazenamento em memória que conta quantas vezes os usuários foram lidos.
// Útil para provar que uma validação acontece ANTES de consultar os dados (L4).
function criarArmazenamentoMemoria(usuariosIniciais = []) {
  let usuarios = structuredClone(usuariosIniciais);
  let sessao = null;
  const armazenamento = {
    leituras: 0,
    lerUsuarios() {
      armazenamento.leituras += 1;
      return structuredClone(usuarios);
    },
    salvarUsuarios(lista) {
      usuarios = structuredClone(lista);
    },
    usuariosSalvos() {
      return structuredClone(usuarios);
    },
    salvarSessao(nova) {
      sessao = structuredClone(nova);
    },
    sessaoSalva() {
      return sessao === null ? null : structuredClone(sessao);
    }
  };
  return armazenamento;
}

// Relógio controlável: permite testar regras de tempo (ex.: bloqueio de 10 minutos, L5)
// sem esperar de verdade.
function criarRelogio(inicio = Date.UTC(2026, 10, 10, 12, 0, 0)) {
  let atual = inicio;
  return {
    agora: () => atual,
    avancarMinutos(minutos) {
      atual += minutos * 60 * 1000;
    }
  };
}

// Monta o serviço de autenticação com armazenamento em memória e relógio controlável
function criarCenario(usuariosIniciais = []) {
  const armazenamento = criarArmazenamentoMemoria(usuariosIniciais);
  const relogio = criarRelogio();
  const auth = AuthCore.criarAuth({ armazenamento, agora: relogio.agora });
  return { auth, armazenamento, relogio };
}

module.exports = { AuthCore, criarArmazenamentoMemoria, criarRelogio, criarCenario };
