describe('Event Management App', () => {
  it('should load homepage', () => {
    cy.visit('http://localhost:5173')
    cy.contains('Event Management').should('be.visible')
    cy.contains('Home').should('be.visible')
    cy.get('#root button.btn').click();
  })
  
  it('should navigate to login page', () => {
    cy.visit('http://localhost:5173')
    cy.contains('Login').click()
    cy.url().should('include', '/login')
    cy.contains('Login', { matchCase: false }).should('be.visible')
  })

  it('should navigate to register page', () => {
  cy.visit('/')
  
  // Wait for page to fully load
  cy.get('nav').should('be.visible')  // Wait for navbar
  cy.wait(500)  // Extra wait
  
  // Now try to click
  cy.contains('Register').click()
  
  cy.url().should('include', '/register')
  })


  it('should show login form elements', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('should show register form elements', () => {
    cy.visit('/register')
    cy.get('input[type="text"]').should('be.visible') // name
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })
})