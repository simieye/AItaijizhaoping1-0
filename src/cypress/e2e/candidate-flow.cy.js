
// 候选人端到端测试
describe('候选人完整流程测试', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**').as('apiCall');
    cy.intercept('POST', '**/cloudfunctions/**').as('cloudFunction');
  });

  context('候选人登录流程', () => {
    it('应该成功登录候选人账户', () => {
      cy.visit('/pages/candidate-login');
      
      // 验证页面元素
      cy.get('[data-cy="candidate-login-title"]').should('contain', '候选人登录');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');

      // 输入登录信息
      cy.get('[data-cy="email-input"]').type('candidate@test.com');
      cy.get('[data-cy="password-input"]').type('Test123456');
      cy.get('[data-cy="login-button"]').click();

      // 验证登录成功
      cy.url().should('include', '/pages/candidate-dashboard');
      cy.get('[data-cy="welcome-message"]').should('contain', '欢迎回来');
    });

    it('应该处理登录失败', () => {
      cy.visit('/pages/candidate-login');
      
      cy.get('[data-cy="email-input"]').type('invalid@test.com');
      cy.get('[data-cy="password-input"]').type('wrongpassword');
      cy.get('[data-cy="login-button"]').click();

      cy.get('[data-cy="error-message"]').should('be.visible');
    });
  });

  context('简历上传流程', () => {
    beforeEach(() => {
      // 模拟已登录状态
      cy.window().then((win) => {
        win.localStorage.setItem('candidate_token', 'mock_token');
      });
      cy.visit('/pages/candidate-resume-upload');
    });

    it('应该成功上传PDF简历', () => {
      cy.get('[data-cy="upload-zone"]').should('be.visible');
      
      // 上传PDF文件
      cy.get('input[type="file"]').selectFile({
        contents: 'cypress/fixtures/sample-resume.pdf',
        fileName: 'sample-resume.pdf',
        mimeType: 'application/pdf'
      });

      cy.get('[data-cy="upload-progress"]').should('be.visible');
      cy.wait('@apiCall');
      
      // 验证上传成功
      cy.get('[data-cy="upload-success"]').should('be.visible');
      cy.get('[data-cy="resume-preview"]').should('contain', 'sample-resume.pdf');
    });

    it('应该验证文件类型', () => {
      cy.get('input[type="file"]').selectFile({
        contents: 'cypress/fixtures/invalid-file.txt',
        fileName: 'invalid-file.txt',
        mimeType: 'text/plain'
      });

      cy.get('[data-cy="file-error"]').should('contain', '不支持的文件格式');
    });
  });

  context('AI面试流程', () => {
    beforeEach(() => {
      cy.visit('/pages/candidate-ai-interview');
    });

    it('应该开始AI面试', () => {
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="interview-setup"]').should('be.visible');
      
      // 选择面试类型
      cy.get('[data-cy="interview-type-technical"]').click();
      cy.get('[data-cy="confirm-setup"]').click();

      // 验证面试开始
      cy.get('[data-cy="interview-progress"]').should('be.visible');
      cy.get('[data-cy="question-display"]').should('be.visible');
    });

    it('应该完成面试并查看结果', () => {
      // 模拟面试过程
      cy.get('[data-cy="start-interview-btn"]').click();
      cy.get('[data-cy="interview-type-behavioral"]').click();
      cy.get('[data-cy="confirm-setup"]').click();

      // 回答问题
      cy.get('[data-cy="question-display"]').should('be.visible');
      cy.get('[data-cy="answer-input"]').type('这是一个很好的回答');
      cy.get('[data-cy="submit-answer"]').click();

      // 完成面试
      cy.get('[data-cy="finish-interview"]').click();
      cy.wait('@cloudFunction');

      // 验证结果页面
      cy.url().should('include', '/pages/candidate-dashboard');
      cy.get('[data-cy="interview-results"]').should('be.visible');
      cy.get('[data-cy="score-display"]').should('contain', '85');
    });
  });

  context('数据一致性验证', () => {
    it('应该验证候选人数据与前端展示一致', () => {
      cy.visit('/pages/candidate-dashboard');
      
      // 验证候选人信息
      cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
        dataSourceName: 'candidate_profile',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: { where: { email: { $eq: 'candidate@test.com' } } }
        }
      }).then((response) => {
        const candidateData = response.body.records[0];
        
        cy.get('[data-cy="candidate-name"]').should('contain', candidateData.name);
        cy.get('[data-cy="candidate-email"]').should('contain', candidateData.email);
        cy.get('[data-cy="match-score"]').should('contain', candidateData.matchScore);
      });
    });
  });
});
