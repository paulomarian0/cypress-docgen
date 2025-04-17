
context('Formulário de Contato', () => {
    describe('Envio de mensagem', () => {
      it('deve enviar mensagem com todos os campos preenchidos corretamente', () => {
        cy.visit('/contato');
  
        cy.get('input[name=nome]').type('Maria Oliveira');
        cy.get('input[name=email]').type('maria@teste.com');
        cy.get('textarea[name=mensagem]').type('Olá! Estou com uma dúvida sobre os serviços.');
        cy.get('button[type=submit]').click();
  
        cy.contains('Mensagem enviada com sucesso').should('be.visible');
      });
  
      it('deve exibir erro se o campo de email estiver vazio', () => {
        cy.visit('/contato');
  
        cy.get('input[name=nome]').type('Maria Oliveira');
        cy.get('textarea[name=mensagem]').type('Mensagem sem email.');
        cy.get('button[type=submit]').click();
  
        cy.contains('Email é obrigatório').should('be.visible');
      });
    });
  });
  