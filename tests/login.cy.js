/// <reference types="cypress" />

context('Autenticação', () => {
    describe('Login com credenciais válidas', () => {
      it('deve permitir o login com usuário e senha corretos', () => {
        cy.visit('/login');
  
        cy.get('input[name=email]').type('usuario@teste.com');
        cy.get('input[name=password]').type('senha123');
        cy.get('button[type=submit]').click();
  
        cy.url().should('include', '/dashboard');
        cy.contains('Bem-vindo').should('be.visible');
      });
    });
  
    describe('Login com credenciais inválidas', () => {
      it('deve exibir mensagem de erro', () => {
        cy.visit('/login');
  
        cy.get('input[name=email]').type('usuario@errado.com');
        cy.get('input[name=password]').type('senhaerrada');
        cy.get('button[type=submit]').click();
  
        cy.contains('Credenciais inválidas').should('be.visible');
      });
    });
  });
  