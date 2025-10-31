
// 性能测试
describe('性能测试', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**').as('apiCall');
  });

  it('应该在3秒内加载候选人仪表板', () => {
    cy.visit('/pages/candidate-dashboard');
    cy.get('[data-cy="loading-spinner"]').should('not.exist');
    cy.get('[data-cy="welcome-message"]').should('be.visible');
    
    cy.window().then((win) => {
      expect(win.performance.timing.loadEventEnd - win.performance.timing.navigationStart).to.be.lessThan(3000);
    });
  });

  it('应该验证缓存命中率', () => {
    cy.visit('/pages/recruiter-dashboard');
    
    // 第一次请求
    cy.wait('@apiCall');
    
    // 第二次相同请求应该使用缓存
    cy.reload();
    cy.window().then((win) => {
      expect(win.cacheManager.getStats().hitRate).to.be.greaterThan(0);
    });
  });

  it('应该测试防抖机制', () => {
    cy.visit('/pages/recruiter-dashboard');
    
    let requestCount = 0;
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**', (req) => {
      requestCount++;
    }).as('debouncedCall');

    // 快速输入多次
    cy.get('[data-cy="search-input"]').type('test');
    cy.wait(400); // 等待防抖时间
    
    expect(requestCount).to.be.lessThan(2);
  });

  it('应该测试Token刷新机制', () => {
    cy.visit('/pages/admin-dashboard');
    
    // 模拟Token过期
    cy.window().then((win) => {
      win.localStorage.setItem('token_expiry', Date.now() - 1000);
    });
    
    cy.get('[data-cy="refresh-token-btn"]').click();
    cy.wait('@apiCall');
    
    cy.get('[data-cy="token-refresh-success"]').should('be.visible');
  });

  it('应该测试错误处理', () => {
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**', {
      statusCode: 500,
      body: { error: 'Server Error' }
    }).as('errorCall');

    cy.visit('/pages/candidate-dashboard');
    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.get('[data-cy="retry-button"]').should('be.visible');
  });
});
