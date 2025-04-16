# Cypress Test Documentation

## File: **cadastro.cy.ts**

### Describe
**Formulário de cadastro**

### URL Visit
`'/cadastro'`

### Context
**Cadastro de novo usuário**

### Tests
- deve cadastrar um novo usuário com dados válidos
- deve exibir erro ao tentar cadastrar com email já usado

---

## File: **contact.cy.spec.ts**

### Describe
**Envio de mensagem**

### URL Visit
`'/contato'`

### Context
**Formulário de Contato**

### Tests
- deve enviar mensagem com todos os campos preenchidos corretamente
- deve exibir erro se o campo de email estiver vazio

---

## File: **file-upload.cy.ts**

### Describe
**Admin**

### URL Visit
`'http://localhost:3000/login'`

### Context
**Admin login**

### Tests
- should log in successfully with valid credentials
- should require email and password fields

---

## File: **login.cy.js**

### Describe
**Login com credenciais válidas**

### URL Visit
`'/login'`

### Context
**Autenticação**

### Tests
- deve permitir o login com usuário e senha corretos
- deve exibir mensagem de erro

---

## File: **testes.cy.ts**

### Describe
**Página de Login**

### URL Visit
`'http://localhost:3000/login'`

### Context
**N/A**

### Tests
- Deve fazer login com credenciais válidas

---

