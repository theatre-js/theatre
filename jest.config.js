module.exports = {
  testMatch: [
    '<rootDir>/packages/*/src/**/*.test.ts',
    '<rootDir>/theatre/*/src/**/*.test.ts',
  ],
  moduleNameMapper: {
    ...require('./devEnv/getAliasesFromTsConfig').getAliasesFromTsConfigForJest(),
    '\\.(css|svg|png)$': 'identity-obj-proxy',
    'lodash-es/(.*)': 'lodash/$1',
    'react-use/esm/(.*)': 'react-use/lib/$1',
    'lodash-es': 'lodash',
    // An ES module that jest can't handle at the moment.
    'react-icons/(.*)': 'identity-obj-proxy',
  },
  setupFiles: ['./theatre/shared/src/setupTestEnv.ts'],
  automock: false,
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
    '^.+\\.js$': 'esbuild-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
