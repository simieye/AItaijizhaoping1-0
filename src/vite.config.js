
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/lib': resolve(__dirname, './lib'),
      '@/pages': resolve(__dirname, './pages'),
      '@/assets': resolve(__dirname, './assets'),
      
      // 强制所有CDN引用指向本地node_modules
      'https://cdn-go.cn/react@18/umd/react.production.min.js': 'react',
      'https://cdn-go.cn/react-dom@18/umd/react-dom.production.min.js': 'react-dom',
      'https://cdn-go.cn/lucide-react@0.263.1/dist/umd/lucide-react.js': 'lucide-react',
      'https://cdn-go.cn/recharts@2.8.0/umd/Recharts.js': 'recharts',
      'https://cdn-go.cn/date-fns@2.30.0/index.js': 'date-fns',
      
      // 拦截所有CDN请求
      'https://cdn-go.cn': resolve(__dirname, './node_modules')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将常用库打包到vendor
          vendor: [
            'react',
            'react-dom',
            'lucide-react',
            'recharts',
            'date-fns',
            'react-hook-form',
            'zod',
            '@hookform/resolvers'
          ],
          'ui-components': [
            '@/components/ui'
          ]
        }
      },
      external: [] // 强制所有依赖打包到bundle
    },
    target: 'es2015',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    cors: true
  },
  css: {
    postcss: './postcss.config.js'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});
