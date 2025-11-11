import { faker } from '@faker-js/faker';

describe('Prueba de registro de usuario y creación de Task', () => {
  it('Task creada con éxito con usuario único', () => {
    // 1. Generar datos únicos (nuevo formato faker)
    const uniqueUsername = faker.internet.username();  // username random
    const uniqueEmail = faker.internet.email();        // email random
    
    cy.visit('https://webapp-tp05-qa-juncos-treachi-fqa5gug9addretfg.canadacentral-01.azurewebsites.net');
    
    cy.get('h1').should('contain', 'TikTask');
    cy.get('#showRegister').click();
    
    cy.get('#registerUsername').type(uniqueUsername);
    cy.get('#registerEmail').type(uniqueEmail);
    cy.get('#registerPassword').type('proyecto');
    cy.get('#registerForm button.btn').click();
    
    cy.get('#addTaskBtn').click();
    cy.get('[name="title"]').type('Estudiar para el final de economia');
    cy.get('[name="description"]').type('Es oral teorico');
    
    cy.get('[name="due_date"]').click();
    cy.get('[name="due_date"]').clear();
    cy.get('[name="due_date"]').type('2025-12-25');
    
    cy.get('#taskForm button.btn-primary').click();
  });
});
