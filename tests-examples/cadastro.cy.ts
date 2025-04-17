/// <reference types="cypress" />

context('Cadastro de novo usuário', () => {
    describe('Formulário de cadastro', () => {
      it('deve cadastrar um novo usuário com dados válidos', () => {
        cy.visit('/cadastro');
  
        cy.get('input[name=nome]').type('João Silva');
        cy.get('input[name=email]').type('joao.silva@teste.com');
        cy.get('input[name=senha]').type('senhaSegura123');
        cy.get('button[type=submit]').click();
  
        cy.url().should('include', '/bem-vindo');
        cy.contains('Cadastro realizado com sucesso').should('be.visible');
      });
  
      it('deve exibir erro ao tentar cadastrar com email já usado', () => {
        cy.visit('/cadastro');
  
        cy.get('input[name=nome]').type('João Silva');
        cy.get('input[name=email]').type('email@existente.com');
        cy.get('input[name=senha]').type('senhaSegura123');
        cy.get('button[type=submit]').click();
  
        cy.contains('Email já cadastrado').should('be.visible');
      });
    });
  });
  