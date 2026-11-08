## Descrição

Tela de **login** (obrigatória) em `index.html`. O usuário informa e-mail e senha; se os dados baterem com um usuário cadastrado no `localStorage`, a sessão é salva e ele vai para o `dashboard.html`.

## Branch

`feature/02-login`

## Tarefas

- [ ] Formulário com campos de e-mail e senha e botão "Entrar"
- [ ] Link "Criar conta" para `cadastro.html`
- [ ] Validação: campos obrigatórios e formato de e-mail
- [ ] Conferir as credenciais na lista `cf_usuarios` do `localStorage`
- [ ] Mensagem de erro clara para dados inválidos (sem `alert`)
- [ ] Salvar o usuário logado em `cf_sessao` e redirecionar para `dashboard.html`
- [ ] Se já houver sessão ativa, ir direto para o `dashboard.html`
- [ ] Estilo da tela (card centralizado)

## Critérios de aceite

- [ ] Login com dados corretos leva ao dashboard
- [ ] Login com dados errados mostra mensagem de erro e não redireciona
- [ ] Não é possível enviar o formulário com campos vazios
