#!/usr/bin/env bash
# =============================================================================
# Setup do repositório no GitHub (GitFlow + labels + 8 cards + Project board)
# Rodar na raiz do projeto, no Git Bash:   bash scripts/setup-github.sh
# Pode ser rodado mais de uma vez: o que já existe é reaproveitado.
# =============================================================================
set -euo pipefail

OWNER="fczymoch"
REPO_NAME="controle-financeiro"
REPO="$OWNER/$REPO_NAME"
REMOTE_URL="https://github.com/$REPO.git"
PROJECT_TITLE="Controle Financeiro - ES II"

cd "$(dirname "$0")/.."
CARDS_DIR="scripts/cards"

# número | título | labels | status inicial no board
CARDS=(
  "01|[CARD 01] Setup do repositório e estrutura base (GitFlow)|tipo:chore,prioridade:alta|Done"
  "02|[CARD 02] Tela de login|tipo:feature,prioridade:alta|Todo"
  "03|[CARD 03] Cadastro de usuário|tipo:feature,prioridade:alta|Todo"
  "04|[CARD 04] Layout base, navegação e logout|tipo:feature,prioridade:alta|Todo"
  "05|[CARD 05] Lançamento de receitas e despesas (CRUD)|tipo:feature,prioridade:alta|Todo"
  "06|[CARD 06] Categorias e filtros por mês|tipo:feature,prioridade:media|Todo"
  "07|[CARD 07] Resumo financeiro: saldo e gráfico|tipo:feature,prioridade:media|Todo"
  "08|[CARD 08] Responsividade, documentação e release v1.0.0|tipo:release,prioridade:media|Todo"
)

passo() { echo; echo "==> $*"; }
erro()  { echo "ERRO: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
passo "Conferindo ferramentas"
command -v git >/dev/null 2>&1 || erro "Git não encontrado. Instale em https://git-scm.com"
command -v gh  >/dev/null 2>&1 || erro "GitHub CLI não encontrado. Instale com: winget install GitHub.cli (e reabra o Git Bash)"

gh auth status >/dev/null 2>&1 || erro "Faça login no GitHub CLI primeiro: gh auth login"
if ! gh auth status 2>&1 | grep -q "'project'"; then
  echo "Liberando a permissão 'project' do GitHub CLI (vai abrir o navegador)..."
  gh auth refresh -h github.com -s project
fi

git config user.name  >/dev/null || erro "Configure seu nome:   git config --global user.name \"Seu Nome\""
git config user.email >/dev/null || erro "Configure seu e-mail: git config --global user.email \"voce@exemplo.com\""

# ---------------------------------------------------------------------------
passo "Git: commit inicial na main"
[ -d .git ] || git init -q
git remote get-url origin >/dev/null 2>&1 || git remote add origin "$REMOTE_URL"

if ! git rev-parse --verify -q HEAD >/dev/null; then
  git add -A
  git commit -q -m "chore: estrutura inicial do projeto (card 01)"
fi
ATUAL=$(git symbolic-ref --short HEAD)
if [ "$ATUAL" = "master" ]; then git branch -M main; fi
git push -u origin main

passo "GitFlow: branch develop"
git show-ref --verify -q refs/heads/develop || git branch develop main
git push -u origin develop
gh repo edit "$REPO" --default-branch develop >/dev/null
git checkout -q develop
echo "develop criada e definida como branch padrão."

# ---------------------------------------------------------------------------
passo "Labels"
criar_label() { gh label create "$1" --color "$2" --description "$3" --force -R "$REPO" >/dev/null; echo "  $1"; }
criar_label "tipo:feature"     "1D76DB" "Nova funcionalidade"
criar_label "tipo:chore"       "BFD4F2" "Configuração e tarefas gerais"
criar_label "tipo:release"     "5319E7" "Preparação de versão"
criar_label "tipo:bug"         "D73A4A" "Correção de erro"
criar_label "prioridade:alta"  "B60205" "Fazer primeiro"
criar_label "prioridade:media" "FBCA04" "Fazer depois das prioridades altas"

# ---------------------------------------------------------------------------
passo "Project board"
PNUM=$(gh project list --owner "$OWNER" --limit 100 --format json \
       --jq ".projects[] | select(.title==\"$PROJECT_TITLE\") | .number" | head -n1)
if [ -z "$PNUM" ]; then
  PNUM=$(gh project create --owner "$OWNER" --title "$PROJECT_TITLE" --format json --jq .number)
  echo "  Projeto criado (#$PNUM)"
else
  echo "  Projeto já existe (#$PNUM)"
fi
gh project link "$PNUM" --owner "$OWNER" --repo "$REPO_NAME" >/dev/null 2>&1 || true

PROJECT_ID=$(gh project view "$PNUM" --owner "$OWNER" --format json --jq .id)
STATUS_FIELD=$(gh project field-list "$PNUM" --owner "$OWNER" --format json \
               --jq '.fields[] | select(.name=="Status") | .id')
opcao_status() {
  gh project field-list "$PNUM" --owner "$OWNER" --format json \
    --jq ".fields[] | select(.name==\"Status\") | .options[] | select(.name==\"$1\") | .id"
}
OPT_TODO=$(opcao_status "Todo")
OPT_DONE=$(opcao_status "Done")

# ---------------------------------------------------------------------------
passo "Cards (issues) no repositório e no board"
for card in "${CARDS[@]}"; do
  IFS='|' read -r NUM TITULO LABELS STATUS <<< "$card"
  ARQ=$(ls "$CARDS_DIR/$NUM"-*.md)

  URL=$(gh issue list -R "$REPO" --state all --limit 200 --json title,url \
        --jq ".[] | select(.title | startswith(\"[CARD $NUM]\")) | .url" | head -n1)
  if [ -z "$URL" ]; then
    URL=$(gh issue create -R "$REPO" --title "$TITULO" --body-file "$ARQ" --label "$LABELS")
    echo "  criado:   $TITULO"
  else
    echo "  já existe: $TITULO"
  fi

  ITEM_ID=$(gh project item-add "$PNUM" --owner "$OWNER" --url "$URL" --format json --jq .id)
  if [ "$STATUS" = "Done" ]; then OPT="$OPT_DONE"; else OPT="$OPT_TODO"; fi
  if [ -n "$STATUS_FIELD" ] && [ -n "$OPT" ]; then
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$STATUS_FIELD" --single-select-option-id "$OPT" >/dev/null
  fi

  if [ "$STATUS" = "Done" ] && [ "$(gh issue view "$URL" --json state --jq .state)" = "OPEN" ]; then
    gh issue close "$URL" --comment "Setup concluído: main e develop criadas, board montado." >/dev/null
  fi
done

# ---------------------------------------------------------------------------
PROJECT_URL=$(gh project view "$PNUM" --owner "$OWNER" --format json --jq .url)
echo
echo "============================================================"
echo " Pronto!"
echo " Repositório: https://github.com/$REPO"
echo " Board:       $PROJECT_URL"
echo
echo " Falta só (no navegador, 1 minuto):"
echo "  1. No board, clique em 'View 1' > Layout > Board"
echo "  2. No repositório: Settings > Collaborators > Add people (colegas)"
echo "  3. No board: ... > Settings > Manage access (mesmos colegas, Write)"
echo "  4. Atribua cada card a uma pessoa (campo Assignees)"
echo "============================================================"
