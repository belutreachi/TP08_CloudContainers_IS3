   describe('Mi primera prueba', () => {
   it('Carga correctamente la página de ejemplo', () => {
     cy.visit('https://webapp-tp05-qa-juncos-treachi-fqa5gug9addretfg.canadacentral-01.azurewebsites.net') // Colocar la url local o de Azure de nuestro front
     cy.get('h1').should('contain', 'TikTask') // Verifica que el título contenga "TikTask"
     cy.get('#loginUsername').click();
     cy.get('#loginUsername').type('admin');
     cy.get('#loginPassword').type('Admin123!{enter}');
     cy.get('#loginForm button.btn').click();
     cy.get('#addTaskBtn').click();
     cy.get('[name="title"]').click();
     cy.get('[name="title"]').type('ESTUDIAR MUCHO');
     cy.get('[name="description"]').type('Lograr entregar los tps a tiempo');
     cy.get('[name="due_date"]').click();
     cy.get('#taskForm button.btn-primary').click();
     cy.get('#tasksList div:nth-child(2) > div.task-actions > button.btn-danger').click();
   })
 })