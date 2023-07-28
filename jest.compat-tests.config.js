/** @type {import('jest').Config} */
module.exports = {
  testMatch: ['<rootDir>/compat-tests/fixtures/*/*.compat-test.ts'],
  moduleNameMapper: {},
  // setupFiles: ['./theatre/shared/src/setupTestEnv.ts'],
  automock: false,
  // transform: {
  //   '^.+\\.tsx?$': [
  //     'esbuild-jest',
  //     {
  //       sourcemap: true,
  //     },
  //   ],
  //   '^.+\\.js$': [
  //     'esbuild-jest',
  //     {
  //       sourcemap: true,
  //     },
  //   ],
  // },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 1000 * 60,
}
