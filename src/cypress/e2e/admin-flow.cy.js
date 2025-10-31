
// 管理员端到端测试
describe('管理员完整流程测试', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**').as('apiCall');
    cy.intercept('POST', '**/cloudfunctions/**').as('cloudFunction');
  });

  context('管理员登录流程', () => {
    it('应该成功登录管理员账户', () => {
      cy.visit('/pages/admin-login');
      
      cy.get('[data-cy="admin-login-title"]').should('contain', '管理员登录');
      cy.get('[data-cy="email-input"]').type('admin@test.com');
      cy.get('[data-cy="password-input"]').type('Admin123456');
      cy.get('[data-cy="login-button"]').click();

      cy.url().should('include', '/pages/admin-dashboard');
      cy.get('[data-cy="admin-welcome"]').should('contain', '系统管理总控台');
    });
  });

  context('系统健康监控', () => {
    beforeEach(() => {
      cy.visit('/pages/admin-dashboard');
    });

    it('应该显示系统健康卡片', () => {
      cy.get('[data-cy="system-health-card"]').should('be.visible');
      cy.get('[data-cy="token-expiry"]').should('be.visible');
      cy.get('[data-cy="error-rate"]').should('be.visible');
      cy.get('[data-cy="request-count"]').should('be.visible');
      cy.get('[data-cy="cache-hit-rate"]').should('be.visible');
    });

    it('应该实时更新Token倒计时', () => {
      cy.get('[data-cy="token-expiry"]').then(($el) => {
        const initialTime = parseInt($el.text());
        cy.wait(2000);
        cy.get('[data-cy="token-expiry"]').should(($el2) => {
          const newTime = parseInt($el2.text());
          expect(newTime).to.be.lessThan(initialTime);
        });
      });
    });

    it('应该在错误率过高时显示警告', () => {
      // 模拟高错误率
      cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**', (req) => {
        req.reply({
          statusCode: 500,
          body: { error: 'Internal Server Error' }
        });
      });

      cy.reload();
      cy.get('[data-cy="error-rate"]').should('have.class', 'text-red-600');
      cy.get('[data-cy="error-warning"]').should('be.visible');
    });

    it('应该刷新Token', () => {
      cy.intercept('POST', '**/cloudfunctions/refreshAccessToken', {
        success: true,
        token: 'new_mock_token'
      }).as('refreshToken');

      cy.get('[data-cy="refresh-token-btn"]').click();
      cy.wait('@refreshToken');
      cy.get('[data-cy="token-refresh-success"]').should('be.visible');
    });
  });

  context('合规审计流程', () => {
    beforeEach(() => {
      cy.visit('/pages/admin-dashboard');
    });

    it('应该显示合规审计数据', () => {
      cy.get('[data-cy="compliance-panel"]').should('be.visible');
      cy.get('[data-cy="compliance-score"]').should('be.visible');
      cy.get('[data-cy="audit-count"]').should('be.visible');
    });

    it('应该查看详细审计记录', () => {
      cy.get('[data-cy="view-audit-details"]').click();
      
      cy.get('[data-cy="audit-modal"]').should('be.visible');
      cy.get('[data-cy="audit-list"]').should('be.visible');
      cy.get('[data-cy="audit-item"]').should('have.length.greaterThan', 0);
    });

    it('应该导出合规报告', () => {
      cy.get('[data-cy="export-compliance"]').click();
      
      cy.get('[data-cy="export-modal"]').should('be.visible');
      cy.get('[data-cy="export-format"]').select('PDF');
      cy.get('[data-cy="confirm-export"]').click();
      
      cy.readFile('cypress/downloads/compliance-report.pdf').should('exist');
    });
  });

  context('用户管理流程', () => {
    beforeEach(() => {
      cy.visit('/pages/admin-dashboard');
    });

    it('应该显示用户列表', () => {
      cy.get('[data-cy="user-table"]').should('be.visible');
      cy.get('[data-cy="user-row"]').should('have.length.greaterThan', 0);
    });

    it('应该搜索用户', () => {
      cy.get('[data-cy="user-search"]').type('testuser');
      cy.get('[data-cy="search-button"]').click();
      
      cy.get('[data-cy="user-row"]').each(($row) => {
        cy.wrap($row).should('contain', 'testuser');
      });
    });

    it('应该更新用户状态', () => {
      cy.get('[data-cy="user-row"]').first().within(() => {
        cy.get('[data-cy="status-toggle"]').click();
      });
      
      cy.get('[data-cy="status-modal"]').should('be.visible');
      cy.get('[data-cy="status-active"]').click();
      cy.get('[data-cy="save-status"]').click();
      
      cy.get('[data-cy="status-success"]').should('be.visible');
    });
  });

  context('数据一致性验证', () => {
    it('应该验证系统统计数据与数据模型一致', () => {
      cy.visit('/pages/admin-dashboard');
      
      // 验证用户总数
      cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
        dataSourceName: 'user',
        methodName: 'wedaGetRecordsV2',
        params: { getCount: true }
      }).then((response) => {
        const totalUsers = response.body.total;
        cy.get('[data-cy="total-users"]').should('contain', totalUsers);
      });

      // 验证职位总数
      cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: { getCount: true }
      }).then((response) => {
        const totalJobs = response.body.total;
        cy.get('[data-cy="total-jobs"]').should('contain', totalJobs);
      });

      // 验证合规审计数据
      cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
        dataSourceName: 'compliance_audit',
        methodName: 'wedaGetRecordsV2',
        params: { getCount: true }
      }).then((response) => {
        const totalAudits = response.body.total;
        cy.get('[data-cy="total-audits"]').should('contain', totalAudits);
      });
    });
  });
});
