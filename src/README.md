
# AI招聘平台 - 本地打包配置

## 概述
本项目已配置为完全本地打包，不依赖任何CDN资源，确保在网络异常或CDN故障时仍能正常运行。

## 技术栈
- **React 18.2.0** - 用户界面库
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Playwright** - E2E测试

## 本地打包特性

### ✅ 无CDN依赖
- 所有第三方库打包到本地 `vendor.js`
- 强制禁用外部CDN引用
- 内联所有关键资源

### ✅ 智能分包
- `vendor.js` - 第三方库
- `index.js` - 应用代码
- `vendor.css` - 第三方样式
- `index.css` - 应用样式

### ✅ 网络降级
- 自动检测网络状态
- 离线模式支持
- 缓存优先策略

## 构建命令

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 构建检查
npm run build:check

# 运行E2E测试
npm run test:e2e

# 生成测试报告
npm run test:report
```

## 文件结构

```
├── package.json          # 依赖版本锁定
├── vite.config.js        # 构建配置
├── tailwind.config.js    # 样式配置
├── index.html           # 入口HTML
├── src/
│   └── main.jsx         # 应用入口
├── scripts/
│   ├── build-check.js   # 构建检查
│   └── generate-test-report.js
└── test-results/        # 测试报告
```

## 缓存策略
- localStorage: 用户配置、基础信息
- IndexedDB: 大体积数据（简历、聊天记录）
- 自动网络恢复同步

## 性能优化
- 代码分割
- 懒加载
- 预加载关键资源
- 构建时压缩优化
