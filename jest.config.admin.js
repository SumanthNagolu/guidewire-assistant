/**
 * Jest configuration for Admin Portal tests
 * Focuses on admin components and integration tests
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  displayName: 'Admin Portal Tests',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/admin/**/*.test.ts?(x)',
    '**/__tests__/admin/**/*.spec.ts?(x)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/admin/**/*.{js,jsx,ts,tsx}',
    'components/admin/**/*.{js,jsx,ts,tsx}',
    'lib/auth/**/*.{js,jsx,ts,tsx}',
    'modules/audit/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThresholds: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

module.exports = createJestConfig(customJestConfig);

