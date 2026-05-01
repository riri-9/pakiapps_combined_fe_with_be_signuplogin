import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  maxWorkers: 1,
  rootDir: '../..',
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e.ts'],
  testTimeout: 120000,
  testEnvironment: './tests/e2e/DetoxJestCircusEnvironment',
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  verbose: true,
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      { configFile: './babel.config.js' },
    ],
  },
};

export default config;
