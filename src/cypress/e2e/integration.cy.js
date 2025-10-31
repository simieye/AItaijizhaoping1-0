
// 集成测试
describe('系统集成测试', () => {
  it('应该测试候选人-招聘者-管理员数据流', () => {
    // 1. 候选人上传简历
    cy.loginAsCandidate();
    cy.visit('/pages/candidate-resume-upload');
    cy.uploadResume('sample-resume.pdf');
    cy.wait('@apiCall');

    // 2. 招聘者发布职位
    cy.loginAsRecruiter();
    cy.visit('/pages/recruiter-job-post');
    cy.get('[data-cy="job-title"]').type('测试职位');
    cy.get('[data-cy="submit-job"]').click();
    cy.wait('@apiCall');

    // 3. 管理员查看系统状态
    cy.loginAsAdmin();
    cy.visit('/pages/admin-dashboard');
    
    // 验证数据一致性
    cy.verifyDataModel('candidate_profile', { count: 1 });
    cy.verifyDataModel('job_post', { count: 1 });
    cy.verifyDataModel('application', { count: 0 }); // 初始状态
  });

  it('应该测试AI面试结果同步', () => {
    cy.loginAsCandidate();
    
    // 完成AI面试
    cy.visit('/pages/candidate-ai-interview');
    cy.get('[data-cy="start-interview-btn"]').click();
    cy.get('[data-cy="interview-type-technical"]').click();
    cy.get('[data-cy="confirm-setup"]').click();
    
    // 回答问题
    cy.get('[data-cy="answer-input"]').type('测试回答');
    cy.get('[data-cy="submit-answer"]').click();
    cy.get('[data-cy="finish-interview"]').click();
    
    // 验证结果同步到招聘者端
    cy.loginAsRecruiter();
    cy.visit('/pages/recruiter-candidates');
    cy.get('[data-cy="candidate-score"]').should('contain', '85');
  });

  it('应该测试消息系统', () => {
    // 招聘者发送消息
    cy.loginAsRecruiter();
    cy.visit('/pages/recruiter-communication');
    cy.get('[data-cy="candidate-select"]').select('候选人A');
    cy.get('[data-cy="message-input"]').type('测试消息');
    cy.get('[data-cy="send-message"]').click();
    
    // 候选人查看消息
    cy.loginAsCandidate();
    cy.visit('/pages/candidate-dashboard');
    cy.get('[data-cy="message-notification"]').should('be.visible');
    cy.get('[data-cy="message-content"]').should('contain', '测试消息');
  });

  it('应该测试缓存一致性', () => {
    // 管理员更新数据
    cy.loginAsAdmin();
    cy.visit('/pages/admin-dashboard');
    
    // 修改用户状态
    cy.get('[data-cy="user-row"]').first().within(() => {
      cy.get('[data-cy="status-toggle"]').click();
    });
    cy.get('[data-cy="status-active"]').click();
    cy.get('[data-cy="save-status"]').click();
    
    // 验证缓存更新
    cy.reload();
    cy.window().then((win) => {
      expect(win.cacheManager.getStats().hitRate).to.be.greaterThan(0);
    });
  });
});
