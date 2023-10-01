/** @type {import('jest').Config} */
module.exports = {
  testMatch: [
    '<rootDir>/packages/*/src/**/*.test.ts',
    '<rootDir>/theatre/*/src/**/*.test.ts',
    '<rootDir>/theatre/*/src/**/*.test.ts',
    '<rootDir>/devEnv/**/*.test.ts',
  ],
  moduleNameMapper: {
    ...require('./devEnv/getAliasesFromTsConfig').getAliasesFromTsConfigForJest(),
    '\\.(css|svg|png)$': 'identity-obj-proxy',
    'lodash-es/(.*)': 'lodash/$1',
    'react-use/esm/(.*)': 'react-use/lib/$1',
    'lodash-es': 'lodash',
    // ES modules that jest can't handle at the moment.
    uuid: '<rootDir>/node_modules/uuid/dist/index.js',
    nanoid: '<rootDir>/node_modules/nanoid/index.cjs',
    'nanoid/non-secure': '<rootDir>/node_modules/nanoid/non-secure/index.cjs',
    'react-icons/(.*)': 'identity-obj-proxy',
    'react-merge-refs': 'identity-obj-proxy',
    '@trpc/client': 'identity-obj-proxy',
  },
  setupFiles: ['./theatre/shared/src/setupTestEnv.ts'],
  automock: false,
  transform: {
    '^.+\\.tsx?$': [
      'jest-esbuild',
      {
        sourcemap: true,
        supported: {
          'dynamic-import': false,
        },
      },
    ],
    '^.+\\.js$': [
      'jest-esbuild',
      {
        sourcemap: true,
        supported: {
          'dynamic-import': false,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
