
# AI招聘平台端到端测试文档

## 测试概述

本测试套件使用 Cypress 对 AI招聘平台进行全面的端到端测试，覆盖所有关键用户流程和数据一致性验证。

## 测试结构

```
cypress/
├── e2e/
│   ├── candidate-flow.cy.js      # 候选人完整流程测试
│   ├── recruiter-flow.cy.js      # 招聘者完整流程测试
│   ├── admin-flow.cy.js          # 管理员完整流程测试
│   ├── accessibility.cy.js         # 无障碍访问测试
│   ├── performance.cy.js         # 性能测试
│   └── integration.cy.js         # 集成测试
├── fixtures/
│   └── sample-resume.pdf         # 测试用PDF文件
├── support/
│   ├── commands.js               # 自定义命令
│   ├── e2e.js                    # 全局配置
│   └── component.js              # 组件测试配置
├── downloads/                    # 下载文件目录
└── README.md                     # 本文档
```

## 测试覆盖范围

### 1. 候选人流程
- ✅ 登录/注册
- ✅ 简历上传（PDF验证）
- ✅ AI面试流程
- ✅ 结果查看
- ✅ 数据一致性验证

### 2. 招聘者流程
- ✅ 登录/注册
- ✅ 职位发布
- ✅ 候选人筛选
- ✅ 消息沟通
- ✅ 数据一致性验证

### 3. 管理员流程
- ✅ 登录
- ✅ 系统健康监控
- ✅ 合规审计
- ✅ 用户管理
- ✅ 数据一致性验证

### 4. 专项测试
- ✅ 无障碍访问（WCAG 2.1）
- ✅ 性能测试（加载时间、缓存命中率）
- ✅ 错误处理
- ✅ 响应式设计

## 运行测试

### 安装依赖
```bash
npm install
```

### 运行所有测试
```bash
npm run test:e2e
```

### 运行特定测试
```bash
# 候选人流程
npm run cypress:run -- --spec "cypress/e2e/candidate-flow.cy.js"

# 招聘者流程
npm run cypress:run -- --spec "cypress/e2e/recruiter-flow.cy.js"

# 管理员流程
npm run cypress:run -- --spec "cypress/e2e/admin-flow.cy.js"

# 冒烟测试
npm run test:smoke
```

### 开发模式
```bash
npm run cypress:open
```

## 测试数据

### 测试用户
- 候选人：`candidate@test.com` / `Test123456`
- 招聘者：`recruiter@test.com` / `Test123456`
- 管理员：`admin@test.com` / `Admin123456`

### 测试文件
- `cypress/fixtures/sample-resume.pdf` - 标准PDF简历

## 测试断言

### 数据一致性验证
- 前端显示与数据模型字段匹配
- 缓存命中率验证
- Token有效期验证
- 错误率监控

### 性能基准
- 页面加载时间 < 3秒
- 缓存命中率 > 60%
- API响应时间 < 1秒

### 无障碍标准
- 通过WCAG 2.1 AA级标准
- 支持键盘导航
- 支持屏幕阅读器

## 环境配置

### Cypress配置
- 视口：1280x720
- 超时：10秒
- 浏览器：Chrome（默认）
- 视频录制：启用

### 环境变量
```javascript
// cypress.config.js
{
  apiUrl: 'https://api.cloudbase.net',
  mockUser: {
    candidate: { email: 'candidate@test.com', password: 'Test123456' },
    recruiter: { email: 'recruiter@test.com', password: 'Test123456' },
    admin: { email: 'admin@test.com', password: 'Admin123456' }
  }
}
```

## 最佳实践

### 测试编写原则
1. **独立性**：每个测试用例独立运行
2. **可重复**：多次运行结果一致
3. **可维护**：使用数据属性定位元素
4. **可读性**：清晰的测试步骤描述

### 错误处理
- 网络错误重试机制
- 超时处理
- 断言失败截图

### 性能优化
- 使用会话保持登录状态
- 智能等待机制
- 并行测试执行

## 持续集成

### GitHub Actions示例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: cypress-io/github-action@v5
        with:
          browser: chrome
          start: npm start
          wait-on: 'http://localhost:3000'
```

## 故障排除

### 常见问题
1. **网络超时**：检查API响应时间
2. **元素定位**：使用`data-cy`属性
3. **文件上传**：确保文件路径正确
4. **缓存问题**：清理浏览器缓存

### 调试技巧
- 使用`cy.pause()`暂停测试
- 查看Cypress日志
- 使用开发者工具检查元素
- 截图和录屏分析

## 更新日志

### v1.0.0
- 初始测试套件
- 覆盖所有核心用户流程
- 数据一致性验证
- 性能基准测试
