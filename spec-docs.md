# Cypress Test Documentation

## Summary

- Total Test Files: **7**
- Cypress Files (.cy): **6**
- Spec Files (.spec): **1**

---

## File: **contact.cy.ts**

**Path:** tests-examples\contact.cy.ts

## Describe: **Message Submission**

### Context: **Contact Form**

#### Tests
- should send message with all fields filled correctly
- should display error if email field is empty

---

## File: **file-upload.cy.ts**

**Path:** tests-examples\file-upload.cy.ts

## Describe: **Document Upload**

### Context: **File Upload**

#### Tests
- should upload a PDF file successfully
- should display error when uploading unsupported file type

---

## File: **login.cy.js**

**Path:** tests-examples\login.cy.js

## Describe: **Valid Login Credentials**

### Context: **Authentication**

#### Tests
- should allow login with correct username and password
- should display error message with incorrect credentials

---

## File: **logout.cy.js**

**Path:** tests-examples\logout.cy.js

## Describe: **Authentication**

### Context: **Authentication**

#### Tests
- should allow login with correct username and password
- should display error message with incorrect credentials

---

## File: **product.cy.ts**

**Path:** tests-examples\product.cy.ts

## Describe: **Product Listing**

### Context: **Product Catalog**

#### Tests
- should display list of products with images and prices
- should filter products by category
- should navigate to product details when clicking on a product

---

## File: **products.spec.js**

**Path:** tests-examples\products.spec.js

## Describe: **Search Functionality**

### Context: **Product Search**

#### Tests
- should find products when searching by name
- should filter products by price range
- should show no results message for non-existent products

---

## File: **registration.cy.ts**

**Path:** tests-examples\registration.cy.ts

## Describe: **Registration Form**

### Context: **User Registration**

#### Tests
- should register a new user with valid data
- should display error when trying to register with an existing email

---

