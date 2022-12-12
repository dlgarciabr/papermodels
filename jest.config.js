const nextJest = require("@blitzjs/next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  globalSetup: "<rootDir>/src/jestGlobalSetup.ts",
  setupFiles: ["<rootDir>/src/setupTests.js"],
};

module.exports = createJestConfig(customJestConfig);
