/// <reference types="cypress" />

/**
 * @description Tests for user registration functionality
 * @author Cypress-DocGen
 */
context('User Registration', () => {
  describe('Registration Form', () => {
    it('should register a new user with valid data', () => {
      // Navigate to registration page
      cy.visit('/register');
      
      // Fill registration form
      cy.get('input[name=name]').type('John Smith');
      cy.get('input[name=email]').type('john.smith@example.com');
      cy.get('input[name=password]').type('SecurePassword123');
      cy.get('button[type=submit]').click();
      
      // Assert successful registration
      cy.url().should('include', '/welcome');
      cy.contains('Registration successful').should('be.visible');
    });
    
    it('should display error when trying to register with an existing email', () => {
      // Navigate to registration page
      cy.visit('/register');
      
      // Fill registration form with existing email
      cy.get('input[name=name]').type('John Smith');
      cy.get('input[name=email]').type('existing@example.com');
      cy.get('input[name=password]').type('SecurePassword123');
      cy.get('button[type=submit]').click();
      
      // Assert error message
      cy.contains('Email already registered').should('be.visible');
    });
  });
});
  