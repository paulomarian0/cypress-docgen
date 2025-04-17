/// <reference types="cypress" />

const { describe } = require("node:test");

/**
 * @description Tests for the authentication functionality
 * @author Cypress-DocGen
 */
describe('Authentication', () => {
    it('should allow login with correct username and password', () => {
      // Navigate to login page
      cy.visit('/login');

      // Fill login form
      cy.get('input[name=email]').type('user@example.com');
      cy.get('input[name=password]').type('password123');
      cy.get('button[type=submit]').click();

      // Assert successful login
      cy.url().should('include', '/dashboard');
      cy.contains('Welcome').should('be.visible');
    });

    it('should display error message with incorrect credentials', () => {
      // Navigate to login page
      cy.visit('/login');

      // Fill login form with invalid data
      cy.get('input[name=email]').type('wrong@example.com');
      cy.get('input[name=password]').type('wrongpassword');
      cy.get('button[type=submit]').click();

      // Assert error message
      cy.contains('Invalid credentials').should('be.visible');
    });
  });
