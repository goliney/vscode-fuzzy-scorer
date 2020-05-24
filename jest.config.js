module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)+(test.ts)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
};
