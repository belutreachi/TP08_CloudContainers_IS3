   describe('Prueba de carga de página', () => {
   it('Carga correctamente la página', () => {
     cy.visit('https://webapp-tp05-qa-juncos-treachi-fqa5gug9addretfg.canadacentral-01.azurewebsites.net') // Colocar la url local o de Azure de nuestro front
     cy.get('h1').should('contain', 'TikTask') // Verifica que el título contenga "TikTask"
   })
 })