module.exports = {
  preset: 'jest-expo',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/src/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json-summary', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.types.ts',
    '!src/**/types/**',
    '!src/**/types.ts',
    '!src/features/**/hooks/use*.ts',
    '!src/features/**/hooks/use*.tsx',
    '!src/features/shared/**',
    '!src/features/**/screens/**',
    '!src/app/**',
    '!src/navigation/**',
    '!src/theme/colors.ts',
    '!src/theme/typography.ts',
    '!src/utils/haptics.ts',
  ],
  coverageThreshold: {
    global: { lines: 80, statements: 80, functions: 80, branches: 80 },
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
