module.exports = () => {
  return {
    autoDetect: true,
    tests: [
      'theatre/**/*.test.ts',
      'packages/dataverse/**/*.test.ts',
      '!**/node_modules/**',
    ],
    testFramework: {
      configFile: './jest.config.js',
    },
  }
}
