
const fs = require('fs');
const path = require('path');

// 生成测试报告
function generateTestReport() {
  const reportDir = './test-results';
  const screenshotDir = path.join(reportDir, 'screenshots');
  
  // 确保目录存在
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // 收集截图
  const screenshots = [];
  if (fs.existsSync(screenshotDir)) {
    const files = fs.readdirSync(screenshotDir);
    files.forEach(file => {
      if (file.endsWith('.png')) {
        screenshots.push({
          name: file,
          path: path.join(screenshotDir, file),
          timestamp: fs.statSync(path.join(screenshotDir, file)).mtime
        });
      }
    });
  }
  
  // 生成报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: screenshots.length,
      passed: screenshots.filter(s => !s.name.includes('error')).length,
      failed: screenshots.filter(s => s.name.includes('error')).length
    },
    screenshots: screenshots.sort((a, b) => b.timestamp - a.timestamp),
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
  
  // 保存报告
  const reportPath = path.join(reportDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // 生成HTML报告
  const htmlReport = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试报告 - AI招聘平台</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .screenshot { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .screenshot img { max-width: 300px; height: auto; border: 1px solid #ccc; }
    .error { border-color: #ff6b6b; background: #ffe0e0; }
    .success { border-color: #51cf66; background: #e8f5e9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI招聘平台 - 测试报告</h1>
    <p>生成时间: ${report.timestamp}</p>
    <p>总计测试: ${report.summary.totalTests}</p>
    <p>通过: ${report.summary.passed}</p>
    <p>失败: ${report.summary.failed}</p>
  </div>
  
  <div>
    <h2>测试截图</h2>
    ${screenshots.map(s => `
      <div class="screenshot ${s.name.includes('error') ? 'error' : 'success'}">
        <h3>${s.name}</h3>
        <img src="${s.path}" alt="${s.name}">
        <p>时间: ${s.timestamp.toLocaleString()}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(reportDir, 'test-report.html'), htmlReport);
  
  console.log('测试报告已生成:');
  console.log('- JSON报告: test-results/test-report.json');
  console.log('- HTML报告: test-results/test-report.html');
}

// 运行报告生成
if (require.main === module) {
  generateTestReport();
}

module.exports = { generateTestReport };
