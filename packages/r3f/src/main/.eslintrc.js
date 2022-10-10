module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/\\u002Fextension\\u002F/]`,
        message: `The main bundle should not be able to import the internals of extension.`,
      },
    ],
  },
}
