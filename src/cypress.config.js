
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      apiUrl: 'https://api.cloudbase.net',
      mockUser: {
        candidate: {
          email: 'candidate@test.com',
          password: 'Test123456'
        },
        recruiter: {
          email: 'recruiter@test.com',
          password: 'Test123456'
        },
        admin: {
          email: 'admin@test.com',
          password: 'Admin123456'
        }
      }
    },
    setupNodeEvents(on, config) {
      // 实现node事件监听
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
});
