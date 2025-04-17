/// <reference types="cypress" />

/**
 * @description Tests for product catalog and details
 * @author Cypress-DocGen
 */
context('Product Catalog', () => {
  describe('Product Listing', () => {
    beforeEach(() => {
      // Navigate to products page before each test
      cy.visit('/products');
    });

    it('should display list of products with images and prices', () => {
      // Verify products are displayed
      cy.get('.product-card').should('have.length.at.least', 3);
      cy.get('.product-image').should('be.visible');
      cy.get('.product-price').should('be.visible');
    });

    it('should filter products by category', () => {
      // Select category filter
      cy.get('select[name=category]').select('Electronics');
      
      // Verify filtered results
      cy.get('.product-card').should('contain', 'Smartphone');
      cy.get('.product-card').should('contain', 'Laptop');
    });

    it('should navigate to product details when clicking on a product', () => {
      // Click on a product
      cy.contains('.product-card', 'Premium Headphones').click();
      
      // Verify navigation to product details
      cy.url().should('include', '/product/');
      cy.get('.product-details').should('be.visible');
      cy.get('h1').should('contain', 'Premium Headphones');
    });
  });
});
  