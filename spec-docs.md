# Cypress Test Documentation

## Summary

- Total Test Files: **9**
- Cypress Files (.cy): **5**
- Spec Files (.spec): **2**
- Test Files (.test): **2**

---

## File: **createEmployeeAPI.cy.js**

**Path:** tests-examples/createEmployeeAPI.cy.js

## Describe: **Employee API Tests**

### Context: **Create Employee**

#### Tests
- should create an employee via API
- should return an error when creating an employee that already exists

### Context: **Update Employee**

#### Tests
- should update an employee via API

### Context: **Delete Employee**

#### Tests
- should delete an employee via API
- should return an error when deleting an employee that does not exist

---

## File: **logout.cy.js**

**Path:** tests-examples/logout.cy.js

## Describe: **Authentication**

### Context: **Authentication**

#### Tests
- should allow login with correct username and password
- should display error message with incorrect credentials

---

## File: **product.test.ts**

**Path:** tests-examples/product.test.ts

## Describe: **Product Listing**

### Context: **Product Catalog**

#### Tests
- should display list of products with images and prices
- should filter products by category
- should navigate to product details when clicking on a product

---

## File: **products.spec.js**

**Path:** tests-examples/products.spec.js

**Description:** Tests for product search and advanced filtering
**Author:** Josue Lobo

## Describe: **Search Functionality**

### Context: **Product Search**

#### Tests
- should find products when searching by name
- should filter products by price range
- should show no results message for non-existent products

---

## File: **contact.cy.ts**

**Path:** tests-examples/qa/contact.cy.ts

## Describe: **Message Submission**

### Context: **Contact Form**

#### Tests
- should send message with all fields filled correctly
- should display error if email field is empty

---

## File: **login.cy.js**

**Path:** tests-examples/qa/login.cy.js

**Description:** Tests for the authentication functionality
**Author:** John Pork

### Context: **Authentication**

#### Tests
- should allow login with correct username and password
- should display error message with incorrect credentials

---

## File: **registration.cy.ts**

**Path:** tests-examples/registration.cy.ts

**Description:** Tests for user registration functionality
**Author:** Paulo Mariano

## Describe: **Registration Form**

### Context: **User Registration**

#### Tests
- should register a new user with valid data
- should display error when trying to register with an existing email

---

## File: **example.test.js**

**Path:** tests-examples/stage/example.test.js

**Description:** Tests for the contact form functionality
**Author:** John Doe

## Describe: **Message Submission**

### Context: **Contact Form**

#### Tests
- should send message with all fields filled correctly
- should display error if email field is empty

---

## File: **file-upload.spec.ts**

**Path:** tests-examples/stage/file-upload.spec.ts

## Describe: **Document Upload**

### Context: **File Upload**

#### Tests
- should upload a PDF file successfully
- should display error when uploading unsupported file type

---

