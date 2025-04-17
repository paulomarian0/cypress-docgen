/// <reference types="cypress" />

/**
 * @description Tests for product search and advanced filtering
 * @author Josue Lobo
 */
context('Product Search', () => {
    describe('Search Functionality', () => {
        beforeEach(() => {
            // Visit the products search page before each test
            cy.visit('/products/search');
        });

        it('should find products when searching by name', () => {
            // Enter search term in search box
            cy.get('input[name=search]').type('Wireless Headphones');
            cy.get('button[aria-label="Search"]').click();

            // Assert search results
            cy.get('.search-results').should('be.visible');
            cy.get('.product-item').should('have.length.at.least', 1);
            cy.contains('.product-name', 'Wireless Headphones').should('be.visible');
        });

        it('should filter products by price range', () => {
            // Set price range filter
            cy.get('input[name=min-price]').clear().type('50');
            cy.get('input[name=max-price]').clear().type('200');
            cy.get('button[data-cy=apply-filter]').click();

            // Assert filtered results
            cy.get('.product-item').each(($item) => {
                cy.wrap($item).within(() => {
                    cy.get('.product-price').invoke('text')
                        .then((text) => {
                            const price = parseFloat(text.replace('$', ''));
                            expect(price).to.be.at.least(50);
                            expect(price).to.be.at.most(200);
                        });
                });
            });
        });

        it('should show no results message for non-existent products', () => {
            // Search for non-existent product
            cy.get('input[name=search]').type('Non-existent Product XYZ123');
            cy.get('button[aria-label="Search"]').click();

            // Assert no results message
            cy.contains('No products found matching your search').should('be.visible');
        });
    });
});
