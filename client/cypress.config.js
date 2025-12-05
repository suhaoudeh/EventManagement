// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",  // Your Vite port
    supportFile: "cypress/support/e2e.js",
  },
});
