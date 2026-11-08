# 💰 Controle Financeiro — Atividade ES II

Aplicação web de **controle financeiro pessoal** feita só com **HTML, CSS e JavaScript** (sem frameworks).
O usuário faz **login**, lança **receitas e despesas**, organiza por **categorias**, filtra por mês e acompanha o **saldo** num resumo com gráfico.

> Projeto acadêmico de Engenharia de Software II. Os dados ficam no `localStorage` do navegador (não há backend).

## Como rodar

1. Clone o repositório e mude para a branch `develop`:
   ```bash
   git clone https://github.com/fczymoch/atividade_ES_II_11_11.git
   cd atividade_ES_II_11_11
   git checkout develop
   ```
2. Abra o `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

## Dados de demonstração

Na primeira vez que o site é aberto, o `js/seed.js` cria **usuários de teste** com lançamentos dos últimos 3 meses. Na tela de login, abra **"Usuários de teste"** e clique num nome para preencher os campos.

| Usuário | E-mail | Senha |
|---------|--------|-------|
| Ana Souza | `ana@demo.com` | `demo123` |
| Bruno Lima | `bruno@demo.com` | `demo123` |
| Carla Mendes | `carla@demo.com` | `demo123` |

O botão **"Restaurar dados de demonstração"** recria só os dados desses usuários. Os usuários cadastrados pelo site não são apagados.

### Formato dos dados no `localStorage`

```js
// cf_usuarios
[{ nome, email, senha /* hash SHA-256 */, criadoEm }]

// cf_sessao
{ nome, email, loginEm }

// cf_transacoes
[{ id, email, descricao, valor, tipo /* "receita" | "despesa" */, categoria, data /* "AAAA-MM-DD" */ }]
```

## Estrutura de pastas

```
├── index.html          # Tela de login (card 02)
├── cadastro.html       # Cadastro de usuário (card 03)
├── dashboard.html      # Área logada (cards 04 a 07)
├── css/
│   └── style.css       # Estilos globais e variáveis
├── js/
│   └── app.js          # Utilitários compartilhados
├── scripts/            # Setup do GitHub (labels, issues, board)
└── .github/            # Templates de issue e pull request
```

## Funcionalidades (cards do board)

| Card | Funcionalidade | Branch |
|------|----------------|--------|
| 01 | Setup do repositório e estrutura base | `main` / `develop` |
| 02 | Tela de login | `feature/02-login` |
| 03 | Cadastro de usuário | `feature/03-cadastro` |
| 04 | Layout base, navegação e logout | `feature/04-layout-navegacao` |
| 05 | Lançamento de receitas e despesas (CRUD) | `feature/05-transacoes` |
| 06 | Categorias e filtros por mês | `feature/06-categorias-filtros` |
| 07 | Resumo financeiro (saldo + gráfico) | `feature/07-resumo-grafico` |
| 08 | Responsividade, documentação e release v1.0.0 | `release/1.0.0` |
| 09 | Carga de dados e criação de usuários | `feature/09-carga-dados` |

## Fluxo de trabalho — GitFlow

| Branch | Para quê | Sai de | Volta para |
|--------|----------|--------|------------|
| `main` | Código em produção (só versões lançadas) | — | — |
| `develop` | Integração das funcionalidades | `main` | — |
| `feature/NN-nome` | Uma funcionalidade = um card | `develop` | `develop` (via PR) |
| `release/x.y.z` | Preparar uma versão | `develop` | `main` + `develop` |
| `hotfix/x.y.z` | Correção urgente em produção | `main` | `main` + `develop` |

### Passo a passo de um card

```bash
# 1. Atualize a develop
git checkout develop
git pull

# 2. Crie a branch do card
git checkout -b feature/02-login

# 3. Trabalhe e faça commits pequenos
git add .
git commit -m "feat: valida e-mail e senha no login (#2)"

# 4. Envie a branch
git push -u origin feature/02-login
```

5. Abra um **Pull Request** de `feature/02-login` para **`develop`**, escrevendo `Closes #2` na descrição.
6. Outra pessoa da equipe revisa e aprova; depois faça o merge.
7. Mova o card para **Done** no board (o `Closes #2` fecha a issue automaticamente).

### Release

```bash
git checkout develop && git pull
git checkout -b release/1.0.0
# ajustes finais, README...
git push -u origin release/1.0.0
```
Abra um PR de `release/1.0.0` para `main`. Depois do merge, crie a tag e leve a release de volta para a `develop`:
```bash
git checkout main && git pull
git tag -a v1.0.0 -m "Versão 1.0.0"
git push origin v1.0.0
git checkout develop && git merge main && git push
```

### Padrão de commits

`tipo: descrição curta (#número-da-issue)`

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `style:` CSS/visual, sem mudar lógica
- `docs:` documentação
- `refactor:` reorganização de código
- `chore:` configuração e tarefas gerais

### Regras da equipe

- Nunca faça commit direto na `main` nem na `develop`: sempre por Pull Request.
- Todo PR precisa de pelo menos 1 revisão de outra pessoa.
- Datas na interface sempre no formato brasileiro **DD/MM/AAAA**, e valores em **R$**.

## Equipe

| Nome | GitHub | Cards |
|------|--------|-------|
| | | |
| | | |
| | | |
| | | |
