// @ts-ignore;
import React from 'react';

import ReactDOM from 'react-dom/client';
import App from '../App.jsx';
import '../index.css';

// 创建根元素
const root = ReactDOM.createRoot(document.getElementById('root'));

// 渲染应用
root.render(<React.StrictMode>
    <App />
  </React.StrictMode>);

// 性能监控
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('页面加载时间:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  });
}

// 错误处理
window.addEventListener('error', event => {
  console.error('全局错误:', event.error);
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise拒绝:', event.reason);
});