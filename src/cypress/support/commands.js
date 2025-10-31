
// 自定义Cypress命令
Cypress.Commands.add('loginAsCandidate', (email = 'candidate@test.com', password = 'Test123456') => {
  cy.session([email, password], () => {
    cy.visit('/pages/candidate-login');
    cy.get('[data-cy="email-input"]').type(email);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/pages/candidate-dashboard');
  });
});

Cypress.Commands.add('loginAsRecruiter', (email = 'recruiter@test.com', password = 'Test123456') => {
  cy.session([email, password], () => {
    cy.visit('/pages/recruiter-login');
    cy.get('[data-cy="email-input"]').type(email);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/pages/recruiter-dashboard');
  });
});

Cypress.Commands.add('loginAsAdmin', (email = 'admin@test.com', password = 'Admin123456') => {
  cy.session([email, password], () => {
    cy.visit('/pages/admin-login');
    cy.get('[data-cy="email-input"]').type(email);
    cy.get('[data-cy="password-input"]').type(password);
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/pages/admin-dashboard');
  });
});

Cypress.Commands.add('uploadResume', (fileName = 'sample-resume.pdf') => {
  cy.get('[data-cy="upload-zone"]').selectFile({
    contents: `cypress/fixtures/${fileName}`,
    fileName: fileName,
    mimeType: 'application/pdf'
  });
});

Cypress.Commands.add('verifyDataModel', (dataSourceName, expectedData) => {
  cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
    dataSourceName: dataSourceName,
    methodName: 'wedaGetRecordsV2',
    params: { getCount: true }
  }).then((response) => {
    expect(response.body.total).to.equal(expectedData.count);
  });
});

Cypress.Commands.add('waitForApi', (alias = '@apiCall') => {
  cy.wait(alias).its('response.statusCode').should('be.oneOf', [200, 201]);
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y();
});

Cypress.Commands.add('verifyCacheHit', (cacheKey) => {
  cy.window().then((win) => {
    const cache = win.cacheManager;
    expect(cache.isValid(cacheKey)).to.be.true;
  });
});
