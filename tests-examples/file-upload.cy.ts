/// <reference types="cypress" />
import { faker } from '@faker-js/faker';
import 'cypress-file-upload';

describe('Admin', () => {
    const url = Cypress.env('ADMIN_stg_url')
    const username = Cypress.env('STG_ADMIN_Email')
    const password = Cypress.env('STG_ADMIN_Pass')
    cy.visit('http://localhost:3000/login');

    Cypress.on('uncaught:exception', (err, runnable) => {
        return false; // Prevents Cypress from failing the test
    });
    beforeEach(() => {
        cy.visit(url);

    });
    context('Admin login', () => {

        it('should log in successfully with valid credentials', () => {
            cy.logInAdmin(username, password);
            //Assert 
            cy.get('[data-cy="workspaces-header"]').should('exist')
            cy.contains('Workspaces').should('exist')
        });

        it('should require email and password fields', () => {
            cy.get('[data-cy="login-submit"]').click();
            cy.contains('You must provide an email').should('be.visible');
            cy.contains('You must provide a password').should('be.visible');
        });



    });


});