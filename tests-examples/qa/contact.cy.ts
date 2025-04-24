/// <reference types="cypress" />

context('Contact Form', () => {
  describe('Message Submission', () => {
    it('should send message with all fields filled correctly', () => {
      // Navigate to contact page
      cy.visit('/contact');
      
      // Fill contact form
      cy.get('input[name=name]').type('Mary Johnson');
      cy.get('input[name=email]').type('mary@example.com');
      cy.get('textarea[name=message]').type('Hello! I have a question about your services.');
      cy.get('button[type=submit]').click();
      
      // Assert success message
      cy.contains('Message sent successfully').should('be.visible');
    });
    
    it('should display error if email field is empty', () => {
      // Navigate to contact page
      cy.visit('/contact');
      
      // Fill form with missing email
      cy.get('input[name=name]').type('Mary Johnson');
      cy.get('textarea[name=message]').type('Message without email.');
      cy.get('button[type=submit]').click();
      
      // Assert error message
      cy.contains('Email is required').should('be.visible');
    });
  });
}); 