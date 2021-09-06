module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[source.value=/@theatre\\u002F(studio|core)\\u002F/]`,
        message: `Importing Theatre's submodules would not work in the production build.`,
      },
    ],
  },
}
