
// 招聘者端到端测试
describe('招聘者完整流程测试', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/cloudbase-cms/api/v1.0/**').as('apiCall');
    cy.intercept('POST', '**/cloudfunctions/**').as('cloudFunction');
  });

  context('招聘者登录流程', () => {
    it('应该成功登录招聘者账户', () => {
      cy.visit('/pages/recruiter-login');
      
      cy.get('[data-cy="recruiter-login-title"]').should('contain', '招聘者登录');
      cy.get('[data-cy="email-input"]').type('recruiter@test.com');
      cy.get('[data-cy="password-input"]').type('Test123456');
      cy.get('[data-cy="login-button"]').click();

      cy.url().should('include', '/pages/recruiter-dashboard');
      cy.get('[data-cy="recruiter-welcome"]').should('contain', '欢迎回来');
    });
  });

  context('发布职位流程', () => {
    beforeEach(() => {
      cy.visit('/pages/recruiter-job-post');
    });

    it('应该成功发布新职位', () => {
      // 填写职位信息
      cy.get('[data-cy="job-title"]').type('高级前端开发工程师');
      cy.get('[data-cy="job-description"]').type('负责公司核心产品的前端开发工作...');
      cy.get('[data-cy="job-location"]').type('北京');
      cy.get('[data-cy="job-salary"]').type('20k-30k');
      
      // 选择技能要求
      cy.get('[data-cy="skill-react"]').click();
      cy.get('[data-cy="skill-typescript"]').click();
      
      // 设置多样性要求
      cy.get('[data-cy="diversity-toggle"]').click();
      cy.get('[data-cy="diversity-weight"]').select('30%');

      // 提交职位
      cy.get('[data-cy="submit-job"]').click();
      cy.wait('@apiCall');

      // 验证发布成功
      cy.get('[data-cy="job-success"]').should('be.visible');
      cy.get('[data-cy="job-id"]').should('be.visible');
    });

    it('应该验证必填字段', () => {
      cy.get('[data-cy="submit-job"]').click();
      
      cy.get('[data-cy="title-error"]').should('contain', '职位标题不能为空');
      cy.get('[data-cy="description-error"]').should('contain', '职位描述不能为空');
    });
  });

  context('查看候选人流程', () => {
    beforeEach(() => {
      cy.visit('/pages/recruiter-candidates');
    });

    it('应该显示候选人列表', () => {
      cy.get('[data-cy="candidate-list"]').should('be.visible');
      cy.get('[data-cy="candidate-card"]').should('have.length.greaterThan', 0);
    });

    it('应该筛选候选人', () => {
      cy.get('[data-cy="skill-filter"]').type('React');
      cy.get('[data-cy="apply-filter"]').click();
      
      cy.get('[data-cy="candidate-card"]').each(($card) => {
        cy.wrap($card).should('contain', 'React');
      });
    });

    it('应该查看候选人详情', () => {
      cy.get('[data-cy="candidate-card"]').first().within(() => {
        cy.get('[data-cy="view-details"]').click();
      });

      cy.get('[data-cy="candidate-modal"]').should('be.visible');
      cy.get('[data-cy="candidate-name"]').should('be.visible');
      cy.get('[data-cy="match-score"]').should('be.visible');
    });
  });

  context('沟通流程', () => {
    beforeEach(() => {
      cy.visit('/pages/recruiter-communication');
    });

    it('应该发送消息给候选人', () => {
      // 选择候选人
      cy.get('[data-cy="candidate-select"]').select('候选人A');
      
      // 输入消息
      cy.get('[data-cy="message-input"]').type('您好，我们对您的简历很感兴趣，希望能安排面试');
      
      // 发送消息
      cy.get('[data-cy="send-message"]').click();
      cy.wait('@apiCall');

      // 验证发送成功
      cy.get('[data-cy="message-sent"]').should('be.visible');
      cy.get('[data-cy="message-content"]').should('contain', '您好，我们对您的简历很感兴趣');
    });

    it('应该查看消息历史', () => {
      cy.get('[data-cy="candidate-select"]').select('候选人A');
      
      // 验证消息历史
      cy.get('[data-cy="message-history"]').should('be.visible');
      cy.get('[data-cy="message-item"]').should('have.length.greaterThan', 0);
    });
  });

  context('数据一致性验证', () => {
    it('应该验证职位数据与前端展示一致', () => {
      cy.visit('/pages/recruiter-dashboard');
      
      cy.request('POST', '**/cloudbase-cms/api/v1.0/**', {
        dataSourceName: 'job_post',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: { where: { recruiterId: { $eq: 'recruiter_demo' } } }
        }
      }).then((response) => {
        const jobs = response.body.records;
        
        cy.get('[data-cy="job-count"]').should('contain', jobs.length);
        jobs.forEach(job => {
          cy.get('[data-cy="job-list"]').should('contain', job.title);
        });
      });
    });
  });
});
