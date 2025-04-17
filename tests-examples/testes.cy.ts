describe('Página de Login', () => {
    it('Deve fazer login com credenciais válidas', () => {
      // Visita a página de login
      cy.visit('http://localhost:3000/login');
  
      cy.get('input[name=email]').type('usuario@email.com');
      cy.get('input[name=password]').type('senhaSegura123');
  
      cy.get('button[type=submit]').click();
  
      cy.url().should('include', '/dashboard');
      cy.contains('Bem-vindo').should('be.visible');
    });
  });
  