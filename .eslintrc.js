module.exports = {
  root: true,
  plugins: ['unused-imports', 'eslint-plugin-tsdoc'],
  extends: ['plugin:react-hooks/recommended'],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    'tsdoc/syntax': 'warn',
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
  ignorePatterns: ['*.d.ts', '*.ignore.ts'],
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
      plugins: ['react'],
      files: ['*.mjs', '*.js'],
      rules: {
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
      },
      parser: 'espree',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  ],
}
