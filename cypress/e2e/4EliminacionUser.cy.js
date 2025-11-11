   describe('Prueba de Eliminación  de Usuario', () => {
   it('La eliminación es exitosa', () => {
     cy.visit('https://webapp-tp05-qa-juncos-treachi-fqa5gug9addretfg.canadacentral-01.azurewebsites.net') // Colocar la url local o de Azure de nuestro front
     cy.get('h1').should('contain', 'TikTask') // Verifica que el título contenga "TikTask"
     cy.get('#loginUsername').click();
     cy.get('#loginUsername').type('admin');
     cy.get('#loginPassword').type('Admin123!');
     cy.get('#loginForm button.btn').click();
     cy.get('#manageUsersBtn').click();
     cy.get('#adminUsersList div:nth-child(1) > div.user-card-actions > button.btn-danger').click();
     cy.get('#refreshUsersBtn').click();
   })
 })