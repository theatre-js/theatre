module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports'],
  parserOptions: {
    project: ['./packages/**/tsconfig.json', './theatre/**/tsconfig.json'],
  },
  extends: [],
  rules: {
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-throw-literal': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          any: {
            message:
              "Don't use any. Use $FixMe or another alternative listed at defs.d.ts",
            fixWith: '$FixMe',
          },
          '{}': false,
          object: false,
        },
      },
    ],
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports-ts': 'warn',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            message: 'Use lodash-es which is tree-shaking friendly',
          },
        ],
      },
    ],
  },
}
