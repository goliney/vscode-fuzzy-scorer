module.exports = {
  verbose: true,
  testMatch: ['**/?(*.)+(spec.js)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  coverageDirectory: '__coverage__',
  coverageReporters: ['lcov', 'text-summary'],
};
