## Descrição

**Lançamento de receitas e despesas** (CRUD completo). Cada lançamento pertence ao usuário logado.

## Branch

`feature/05-transacoes`

## Tarefas

- [ ] Formulário: descrição, valor, tipo (receita/despesa), categoria e data
- [ ] Validações: descrição obrigatória, valor maior que zero, data obrigatória
- [ ] Salvar em `cf_transacoes` do `localStorage`, vinculado ao e-mail do usuário
- [ ] Listar os lançamentos em tabela (mais recentes primeiro)
- [ ] Editar um lançamento
- [ ] Excluir um lançamento com confirmação na própria tela (sem `confirm()`)
- [ ] Receitas em verde e despesas em vermelho
- [ ] Datas exibidas em **DD/MM/AAAA** e valores em **R$** (usar `formatarData` e `formatarMoeda` do `app.js`)

## Critérios de aceite

- [ ] Criar, editar e excluir funcionam e persistem após recarregar a página
- [ ] Um usuário não vê os lançamentos de outro
- [ ] Datas no padrão brasileiro e valores em reais
