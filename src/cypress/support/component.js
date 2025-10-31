
// cypress/support/component.js
import { mount } from 'cypress/react';
import './commands';

// 组件测试配置
Cypress.Commands.add('mount', mount);

// 全局样式
import '../../index.css';

// 组件测试前的设置
beforeEach(() => {
  cy.viewport(1280, 720);
});
