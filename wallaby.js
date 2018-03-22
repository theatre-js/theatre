module.exports = function(wallaby) {
  return {
    files: [
      'src/**/*.tsx',
      '!src/**/*.test.tsx',
      'tsconfig.jest.json',
      'package.json',
    ],

    tests: ['src/**/*.test.tsx'],

    env: {
      type: 'node',
      runner: 'node', // or full path to any node executable
    },

    debug: true,
    testFramework: 'jest',

    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({
        module: 'commonjs',
        target: 'es6',
        allowSyntheticDefaultImports: true,
      }),
    },
    setup(wallaby) {
      var jestConfig = require('./package.json').jest
      // for example:
      // jestConfig.globals = { "__DEV__": true };
      wallaby.testFramework.configure(jestConfig)
    },
  }
}
