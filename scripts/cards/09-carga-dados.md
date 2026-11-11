## Descrição

**Carga de dados de demonstração** e **usuários de teste**, para o site já ter dados ao ser aberto (hoje o `localStorage` começa vazio e não há como testar login, lançamentos, filtros e resumo).

## Branch

`feature/09-carga-dados`

## Tarefas

- [x] Criar `js/seed.js` com 3 usuários de teste (senha `demo123`, guardada como hash SHA-256)
- [x] Gerar lançamentos de exemplo (receitas e despesas) do mês atual e dos 2 anteriores, nas categorias padrão
- [x] Rodar a carga só uma vez (controle de versão em `cf_seed_versao`), sem apagar dados criados pelo site
- [x] Painel "Usuários de teste" na tela de login, que preenche e-mail e senha com um clique
- [x] Botão "Restaurar dados de demonstração"
- [x] Criação de usuários pelo site: link "Criar conta" do login leva ao `cadastro.html` (card 03), que também roda a carga para os e-mails de teste já ficarem reservados
- [x] Lançamentos de exemplo com `criadoEm`, no mesmo formato do card 05
- [x] Documentar no README os usuários de teste e o formato de `cf_usuarios`, `cf_sessao` e `cf_transacoes`

## Critérios de aceite

- [x] Ao abrir o site pela primeira vez, já é possível entrar com `ana@demo.com` / `demo123`
- [x] Cada usuário de teste tem lançamentos nos últimos 3 meses
- [x] Usuários cadastrados pelo site não são apagados pela carga nem pelo botão de restaurar
- [x] Datas guardadas como `AAAA-MM-DD` para serem exibidas em DD/MM/AAAA
- [x] "Criar conta" abre o cadastro sem erro, e o usuário criado consegue entrar
- [x] Não é possível cadastrar um e-mail de usuário de teste
