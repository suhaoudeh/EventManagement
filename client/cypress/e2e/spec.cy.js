describe('Event Management App', () => {
  it('should load homepage', () => {
    cy.visit('http://localhost:5173')
    cy.contains('Event Management').should('be.visible')
    cy.contains('Home').should('be.visible')
  })
  
  it('should navigate to login page', () => {
    cy.visit('http://localhost:5173')
    cy.contains('Login').click()
    cy.url().should('include', '/login')
    cy.contains('Login', { matchCase: false }).should('be.visible')
  })
})