const nextJest = require("@blitzjs/next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  globalSetup: "<rootDir>/src/jestGlobalSetup.ts",
  setupFiles: ["<rootDir>/src/setupTests.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
