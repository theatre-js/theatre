/**
 * @remarks
 * Notes on plugins we _don't_ use:
 *
 *  ## plugin:react-hooks
 *  We don't use the react hooks plugin because it disallows valid use-cases
 *  such as this:
 *
 *  ```ts
 *  export default function useValToAtom<S>(val: S): Atom<S> {
 *  const atom = useMemo(() => {
 *    return new Atom(val)
 *  }, []) // <-- we don't _need_ to include `val` here, but the lint rule will require it
 *
 *  useLayoutEffect(() => {
 *    atom.setState(val)
 *  }, [val]) // <-- we also know `atom` will never change, but the lint rule doesn't
 *
 *  return atom
 * ```
 *
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  root: true,
  plugins: ['unused-imports', 'eslint-plugin-tsdoc'],
  extends: [],
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
  ignorePatterns: ['*.d.ts', '*.ignore.ts', 'compatibility-tests/*'],
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
          './devEnv/tsconfig.json',
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
        'tsdoc/syntax': 'off',
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
