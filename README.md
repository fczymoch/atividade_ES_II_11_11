# 💰 Controle Financeiro

Aplicação web de **controle financeiro pessoal** feita só com **HTML, CSS e JavaScript** (sem frameworks).
O usuário faz **login**, lança **receitas e despesas**, organiza por **categorias**, filtra por mês e acompanha o **saldo** num resumo com gráfico.

> Projeto da disciplina Engenharia de Software II. Os dados ficam no `localStorage` do navegador (não há backend).

## Como rodar

1. Clone o repositório (a branch `main` tem a versão estável **v1.0.0**):
   ```bash
   git clone https://github.com/fczymoch/atividade_ES_II_11_11.git
   cd atividade_ES_II_11_11
   ```
2. Abra o `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

## Como rodar os testes

Os testes automatizados usam o test runner nativo do Node (`node:test`), sem instalar dependências.

1. Tenha o **Node.js 18 ou mais novo** (`node -v`). No Ubuntu, se a versão do `apt` for antiga:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
2. Na raiz do projeto, rode:
   ```bash
   npm test
   ```

Os testes ficam em `tests/` e testam o `js/auth-core.js`, onde estão as regras de login e cadastro (a mesma lógica usada pelas telas).

## Login: comportamentos e testes

| | Comportamento | Teste |
|---|---|---|
| L1 | Cadastro com e-mail e senha válidos cria o usuário; a senha é gravada com hash, nunca em texto puro | T1 |
| L2 | E-mail e senha corretos retornam sucesso e identificam o usuário (sessão em `cf_sessao`) | T2 (`tests/l2-login-sucesso.test.js`) |
| L3 | Senha errada retorna erro sem dizer se foi o e-mail ou a senha | T3 (`tests/l3-senha-errada.test.js`) |
| L4 | E-mail vazio ou sem @ é rejeitado antes de consultar os usuários | T4 (`tests/l4-validacao-email.test.js`) |
| L5 | Após 3 senhas erradas seguidas, a conta bloqueia por 10 minutos | T5 |
| L6 | Senha com menos de 8 caracteres é rejeitada no cadastro | T6 (`tests/l6-senha-minima.test.js`) |

Não existe usuário fixo no código: para entrar, crie uma conta em **Criar conta**.

## Dados no navegador

```js
// cf_usuarios
[{ nome, email, senha /* hash SHA-256 */, criadoEm }]

// cf_sessao
{ nome, email, loginEm }

// cf_transacoes
[{ id, email, descricao, valor, tipo /* "receita" | "despesa" */, categoria, data /* "AAAA-MM-DD" */ }]
```

## Telas

> Substitua os arquivos em `docs/prints/` pelos prints reais (mesmos nomes).

| Tela | Print |
|------|-------|
| Login | ![Login](docs/prints/login.png) |
| Cadastro | ![Cadastro](docs/prints/cadastro.png) |
| Resumo e gráfico | ![Resumo](docs/prints/resumo.png) |
| Lançamentos e filtros | ![Lançamentos](docs/prints/lancamentos.png) |
| Categorias | ![Categorias](docs/prints/categorias.png) |
| Versão para celular | ![Celular](docs/prints/celular.png) |

## Estrutura de pastas

```
├── index.html          # Tela de login (card 02)
├── cadastro.html       # Cadastro de usuário (card 03)
├── dashboard.html      # Área logada (cards 04 a 07)
├── css/                # Estilos (style.css = globais; responsivo.css = celular e tablet)
├── js/                 # Scripts de cada tela (app.js = utilitários compartilhados)
│   └── auth-core.js    # Regras de login e cadastro, usadas pelas telas e pelos testes
├── tests/              # Testes automatizados (npm test)
├── package.json        # Comando de testes
├── docs/prints/        # Prints das telas usados neste README
├── scripts/            # Setup do GitHub (labels, issues, board)
└── .github/            # Templates de issue e pull request
```

## Responsividade

O layout se adapta a **tablet (até 900px)** e **celular (até 600px)**, sem rolagem horizontal. No celular, a tabela de lançamentos vira uma lista de cartões. Os estilos ficam em `css/responsivo.css`.

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

- Nunca faça commit direto na `main`: ela é protegida e só recebe Pull Request com 1 aprovação.
- **Sprint 1:** cada pessoa cria a branch pela própria issue (*Development > Create a branch*) e abre o PR para a `main` com `Closes #N`, "O que foi feito" e "Como testar".
- Quem aprova e faz o merge é um colega, nunca o autor do PR.
- Datas na interface sempre no formato brasileiro **DD/MM/AAAA**, e valores em **R$**.

## Equipe

| Nome | GitHub | Papel |
|------|--------|-------|
| Felipe | [@fczymoch](https://github.com/fczymoch) | Product Owner (PO) e Developer |
| Gabriel | [@gabrieldelin](https://github.com/gabrieldelin) | Scrum Master (SM) e Developer |
| Carlos Eduardo Dias | [@guidegames123](https://github.com/guidegames123) | Developer |
| Leonardo | [@LeoLGBO](https://github.com/LeoLGBO) | Developer |
