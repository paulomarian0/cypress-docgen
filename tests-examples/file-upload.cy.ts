/// <reference types="cypress" />
import 'cypress-file-upload';

/**
 * @description Tests for the file upload functionality
 * @author Cypress-DocGen
 */
context('File Upload', () => {
  describe('Document Upload', () => {
    beforeEach(() => {
      // Navigate to the upload page before each test
      cy.visit('/upload');
    });

    it('should upload a PDF file successfully', () => {
      // Prepare the file upload
      cy.fixture('example.pdf').then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'example.pdf',
          mimeType: 'application/pdf'
        });
        
        // Submit the upload
        cy.get('button[type=submit]').click();
        
        // Assert success message
        cy.contains('File uploaded successfully').should('be.visible');
      });
    });

    it('should display error when uploading unsupported file type', () => {
      // Prepare invalid file upload
      cy.fixture('example.exe').then((fileContent) => {
        cy.get('input[type="file"]').attachFile({
          fileContent,
          fileName: 'example.exe',
          mimeType: 'application/octet-stream'
        });
        
        // Submit the upload
        cy.get('button[type=submit]').click();
        
        // Assert error message
        cy.contains('Unsupported file type').should('be.visible');
      });
    });
  });
});