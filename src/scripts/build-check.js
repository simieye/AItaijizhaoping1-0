
#!/usr/bin/env node

// 构建检查脚本
const fs = require('fs');
const path = require('path');

// 检查构建输出
function checkBuildOutput() {
  const distDir = './dist';
  
  if (!fs.existsSync(distDir)) {
    console.error(' 构建目录不存在');
    process.exit(1);
  }
  
  const requiredFiles = [
    'index.html',
    'vendor.js',
    'vendor.css',
    'assets/index.js',
    'assets/index.css'
  ];
  
  const missingFiles = requiredFiles.filter(file => 
    !fs.existsSync(path.join(distDir, file))
  );
  
  if (missingFiles.length > 0) {
    console.error('❌ 缺失文件:', missingFiles);
    process.exit(1);
  }
  
  // 检查文件大小
  const vendorPath = path.join(distDir, 'vendor.js');
  const vendorSize = fs.statSync(vendorPath).size;
  const vendorSizeMB = (vendorSize / 1024 / 1024).toFixed(2);
  
  console.log(`✅ 构建检查通过`);
  console.log(`📦 vendor.js 大小: ${vendorSizeMB} MB`);
  
  // 检查是否包含CDN引用
  const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  const cdnReferences = [
    'cdn-go.cn',
    'unpkg.com',
    'jsdelivr.net'
  ];
  
  const foundCDNs = cdnReferences.filter(cdn => 
    indexHtml.includes(cdn)
  );
  
  if (foundCDNs.length > 0) {
    console.warn('⚠️ 发现CDN引用:', foundCDNs);
  } else {
    console.log(' 无CDN引用，全部本地打包');
  }
}

// 运行检查
checkBuildOutput();
