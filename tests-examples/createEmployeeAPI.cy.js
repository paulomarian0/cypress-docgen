/// <reference types="cypress" />
import { faker } from '@faker-js/faker';

describe('Employee API Tests', () => {
    context('Create Employee', () => {
        it('should create an employee via API', () => {
            const employeeId = faker.string.alpha(10)
            const email = `josue.lobo+${employeeId}@loremIpsium.com`;
            const employeePayload = createEmployeePayload(employeeId, email);

            cy.createEmployee(employeePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(response => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('message', 'Employees successfully created');
            });
        });

        it('should return an error when creating an employee that already exists', () => {
            const employeeId = faker.string.alpha(10)
            const email = `josue.lobo+${employeeId}@loremIpsium.com`;
            const employeePayload = createEmployeePayload(employeeId, email);

            cy.createEmployee(employeePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(() => {
                cy.createEmployee(employeePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(response => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', 'Validation and check errors found');
                    expect(response.body.error[0]).to.have.property('employeeId', employeeId);
                    expect(response.body.error[0]).to.have.property('error', 'Employee already exists');
                });
            })
        });
    })

    context('Update Employee', () => {
        it('should update an employee via API', () => {
            const employeeId = faker.string.alpha(10)
            const email = `josue.lobo+${employeeId}@loremIpsium.com`;
            const employeePayload = createEmployeePayload(employeeId, email);

            cy.createEmployee(employeePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(response => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('message', 'Employees successfully created');

                const updatedPayload = createEmployeePayload(employeeId, email);
                updatedPayload.employees[0].title = 'Senior Tester';
                updatedPayload.employees[0].department = 'qa';

                cy.updateEmployeeAPI(updatedPayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(updateResponse => {
                    expect(updateResponse.status).to.eq(200);
                    expect(updateResponse.body).to.have.property('message', 'Employees were successfully updated');
                    expect(updateResponse.body).to.have.property('data');
                    expect(updateResponse.body.data).to.have.property('employeeIDs');
                    expect(updateResponse.body.data.employeeIDs).to.include(employeeId);
                });
            });
        });
    })

    context('Delete Employee', () => {
        it('should delete an employee via API', () => {
            const employeeId = faker.string.alpha(10)
            const email = `josue.lobo+${employeeId}@loremIpsium.com`;
            const employeePayload = createEmployeePayload(employeeId, email);

            cy.createEmployee(employeePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(response => {
                expect(response.status).to.eq(201);
                expect(response.body).to.have.property('message', 'Employees successfully created');

                const deletePayload = createDeletePayload(employeeId);

                cy.deleteEmployeeAPI(deletePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(deleteResponse => {
                    expect(deleteResponse.status).to.eq(204);
                });
            });
        });

        it('should return an error when deleting an employee that does not exist', () => {
            const nonExistentEmployeeId = faker.string.alpha(10);
            const deletePayload = createDeletePayload(nonExistentEmployeeId);

            cy.deleteEmployeeAPI(deletePayload, Cypress.env('STG_API_URL'), Cypress.env('STG_API_KEY')).then(response => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', 'Validation and check errors found');
                expect(response.body.error[0]).to.have.property('employeeId', nonExistentEmployeeId);
                expect(response.body.error[0]).to.have.property('error', 'Employee ID does not exist in the database');
            });
        });
    })

});