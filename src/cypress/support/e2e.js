
// cypress/support/e2e.js
import './commands';
import 'cypress-axe';

// 全局配置
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略特定的错误
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});

// 设置默认视口
Cypress.config('viewportWidth', 1280);
Cypress.config('viewportHeight', 720);

// 设置默认超时
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);

// 测试前清理
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// 测试后清理
afterEach(() => {
  cy.window().then((win) => {
    if (win.cacheManager) {
      win.cacheManager.clear();
    }
  });
});
