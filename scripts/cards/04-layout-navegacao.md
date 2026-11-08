## Descrição

Estrutura da área logada (`dashboard.html`): cabeçalho, navegação, **logout** e **proteção de acesso** (quem não está logado volta para o login).

## Branch

`feature/04-layout-navegacao`

## Tarefas

- [ ] Criar `dashboard.html` com cabeçalho (logo, nome do usuário, botão "Sair")
- [ ] Menu de navegação entre as seções: Resumo, Lançamentos, Categorias
- [ ] Criar `js/auth.js`: se não houver `cf_sessao`, redirecionar para `index.html`
- [ ] Botão "Sair" apaga a sessão e volta para o login
- [ ] Componentes visuais reutilizáveis no `style.css` (botões, inputs, cards, tabela)
- [ ] Rodapé com nome do projeto e equipe

## Critérios de aceite

- [ ] Acessar `dashboard.html` sem login redireciona para o login
- [ ] Nome do usuário logado aparece no cabeçalho
- [ ] Logout funciona e impede voltar ao dashboard sem novo login
