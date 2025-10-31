
// 无障碍访问测试
describe('无障碍访问测试', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  it('候选人页面应该通过无障碍检查', () => {
    cy.visit('/pages/candidate-login');
    cy.checkA11y();

    cy.loginAsCandidate();
    cy.visit('/pages/candidate-dashboard');
    cy.checkA11y();

    cy.visit('/pages/candidate-resume-upload');
    cy.checkA11y();

    cy.visit('/pages/candidate-ai-interview');
    cy.checkA11y();
  });

  it('招聘者页面应该通过无障碍检查', () => {
    cy.visit('/pages/recruiter-login');
    cy.checkA11y();

    cy.loginAsRecruiter();
    cy.visit('/pages/recruiter-dashboard');
    cy.checkA11y();

    cy.visit('/pages/recruiter-job-post');
    cy.checkA11y();

    cy.visit('/pages/recruiter-candidates');
    cy.checkA11y();
  });

  it('管理员页面应该通过无障碍检查', () => {
    cy.visit('/pages/admin-login');
    cy.checkA11y();

    cy.loginAsAdmin();
    cy.visit('/pages/admin-dashboard');
    cy.checkA11y();
  });

  it('应该支持键盘导航', () => {
    cy.visit('/pages/candidate-login');
    
    // 测试Tab键导航
    cy.get('body').tab();
    cy.focused().should('have.attr', 'data-cy', 'email-input');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-cy', 'password-input');
    
    cy.focused().tab();
    cy.focused().should('have.attr', 'data-cy', 'login-button');
  });

  it('应该支持屏幕阅读器', () => {
    cy.visit('/pages/candidate-dashboard');
    
    // 验证ARIA标签
    cy.get('[role="main"]').should('have.attr', 'aria-label');
    cy.get('[role="navigation"]').should('have.attr', 'aria-label');
    cy.get('button').each(($btn) => {
      cy.wrap($btn).should('have.attr', 'aria-label').or('have.text');
    });
  });
});
