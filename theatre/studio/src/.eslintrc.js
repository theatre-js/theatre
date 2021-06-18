module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@theatre\\u002Fcore/]`,
        message:
          '@theatre/studio may not import @theatre/core modules except via type imports.',
      },
    ],
  },
}
