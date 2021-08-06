module.exports = {
  root: true,
  plugins: ['unused-imports'],
  extends: [],
  rules: {
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
  ignorePatterns: ['*.d.ts'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        project: [
          './theatre/tsconfig.json',
          './packages/*/tsconfig.json',
          './packages/*/devEnv/tsconfig.json',
          './examples/*/tsconfig.json',
        ],
      },
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
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['*.mjs', '*.js'],
      parser: 'espree',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
      },
    },
  ],
}
