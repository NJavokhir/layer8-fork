import 'cypress-file-upload'

describe('Layer8 Interceptor / Middleware Functions', () => {
  it('loads the page', () => {
    cy.visit('/')
    cy.contains('h1', 'Layer8 Interceptor & Middleware Test Suite')
  })

  it('ensures the WASM module is loaded', () =>{
    cy.visit('/')
    cy.get('[data-cy="persistence-check-btn"]').click()
    cy.get('[data-cy="persistence-check-btn"]').click()
    cy.get('[data-cy="persistence-check-btn"]').click()
    cy.get('[data-cy="persistence-check-counter"]').contains('3')    
  })

  it('check the tunnel is open', () =>{
    cy.visit('/')
    cy.get('[data-cy="open-encrypted-tunnel-btn"]').click()
    cy.get('[data-cy="open-tunnel-flag"]').contains('true')    
  })

  it('makes a simple GET request through the tunnel', ()=>{
    cy.visit('/')
    cy.get('[data-cy="open-encrypted-tunnel-btn"]').click()
    cy.get('[data-cy="simple-get-btn"]').click()
    cy.get('[data-cy="simple-get-response"]').should("include.text", "number")
  })

  it('makes a simple POST request through the tunnel', ()=>{
    cy.visit('/')
    cy.get('[data-cy="open-encrypted-tunnel-btn"]').click()
    cy.get('[data-cy="simple-post-btn"]').click()
    cy.get('[data-cy="simple-post-response"]').contains("layer8")
  })

  it('uploads an image', ()=>{
    cy.visit('/')
    cy.get('[data-cy="open-encrypted-tunnel-btn"]').click()    
    cy.fixture("test_image.jpg", "binary").then(image => {
      const blob = Cypress.Blob.binaryStringToBlob(image); 
      cy.get('input[type="file"]').attachFile({
        fileContent: blob,
        fileName: 'cypress_test_image.jpg',
        mimeType: 'image/jpg'
    });
    })

    cy.get('[data-cy="upload-image-result"]').find("img").should('be.visible');
  })



})
