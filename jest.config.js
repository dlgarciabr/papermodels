// jest.config.js
const nextJest = require("@blitzjs/next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  moduleDirectories: ["node_modules", "<rootDir>/"],
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
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
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.test.{ts,tsx}",
    "!<rootDir>/src/**/{mutations,queries}/**",
    "!<rootDir>/db/**",
    "!src/pages/api/rpc/**",
    "!src/{blitz-*,jestGlobalSetup}.ts",
    "!test/**",
  ],
};

module.exports = async () => {
  const nextJestConfig = await (await createJestConfig(customJestConfig))();
  const jestConfig = {
    ...nextJestConfig,
    transformIgnorePatterns: ["node_modules/(?!(nanoid))/"],
  };
  return jestConfig;
};
