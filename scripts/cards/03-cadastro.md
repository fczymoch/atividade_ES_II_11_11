## Descrição

Tela de **cadastro de usuário** (`cadastro.html`), necessária para que exista alguém para fazer login.

## Branch

`feature/03-cadastro`

## Tarefas

- [ ] Formulário com nome, e-mail, senha e confirmação de senha
- [ ] Validações: campos obrigatórios, e-mail válido, senha com no mínimo 6 caracteres, senhas iguais
- [ ] Impedir cadastro de e-mail já existente
- [ ] Salvar o usuário na lista `cf_usuarios` do `localStorage`
- [ ] (Bônus) Guardar a senha como hash SHA-256 com `crypto.subtle`
- [ ] Mensagem de sucesso e redirecionamento para o login
- [ ] Link "Já tenho conta" para `index.html`

## Critérios de aceite

- [ ] Usuário cadastrado consegue fazer login no card 02
- [ ] E-mail duplicado mostra mensagem de erro
- [ ] Senhas diferentes impedem o cadastro
