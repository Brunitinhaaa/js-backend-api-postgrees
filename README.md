# API de Controle Financeiro

Bem-vindo à API de Controle Financeiro! Esta API permite que os usuários gerenciem suas transações e categorias financeiras de forma eficaz.

## Descrição

Esta API foi desenvolvida para fornecer funcionalidades de controle financeiro pessoal. Com esta API, os usuários podem:

- Cadastrar e atualizar seu perfil de usuário.
- Realizar login para acessar suas informações pessoais.
- Gerenciar categorias para classificar suas transações financeiras.
- Adicionar, visualizar, atualizar e excluir transações financeiras.
- Gerar um extrato financeiro com a soma de suas transações.

## Endpoints

1. **Cadastrar usuário**
   - Método: POST
   - Rota: `/usuario`
   - Descrição: Cadastra um novo usuário no sistema.

2. **Login do usuário**
   - Método: POST
   - Rota: `/login`
   - Descrição: Permite que um usuário cadastrado faça login no sistema.

3. **Detalhar usuário**
   - Método: GET
   - Rota: `/usuario`
   - Descrição: Obtém os dados do perfil do usuário logado.

4. **Atualizar usuário**
   - Método: PUT
   - Rota: `/usuario`
   - Descrição: Atualiza as informações do usuário logado.

5. **Listar categorias**
   - Método: GET
   - Rota: `/categoria`
   - Descrição: Lista todas as categorias cadastradas.

6. **Listar transações do usuário logado**
   - Método: GET
   - Rota: `/transacao`
   - Descrição: Lista todas as transações do usuário logado.

7. **Detalhar uma transação do usuário logado**
   - Método: GET
   - Rota: `/transacao/:id`
   - Descrição: Obtém os detalhes de uma transação específica do usuário logado.

8. **Cadastrar transação para o usuário logado**
   - Método: POST
   - Rota: `/transacao`
   - Descrição: Cadastra uma nova transação associada ao usuário logado.

9. **Atualizar transação do usuário logado**
   - Método: PUT
   - Rota: `/transacao/:id`
   - Descrição: Atualiza uma transação específica do usuário logado.

10. **Excluir transação do usuário logado**
    - Método: DELETE
    - Rota: `/transacao/:id`
    - Descrição: Exclui uma transação específica do usuário logado.

11. **Obter extrato de transações**
    - Método: GET
    - Rota: `/transacao/extrato`
    - Descrição: Obtém um extrato com a soma das transações de entrada e saída do usuário logado.

12. **Filtrar transações por categoria** (Extra)
    - Método: GET
    - Rota: `/transacao?filtro[]=categoria1&filtro[]=categoria2`
    - Descrição: Lista transações do usuário logado filtradas por categoria.

## Como Usar

1. Clone este repositório em seu ambiente local.
2. Configure e inicie o servidor da API.
3. Use as rotas e endpoints acima para interagir com a API.


