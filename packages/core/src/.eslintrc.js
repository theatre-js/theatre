module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@theatre\\u002Fstudio/]`,
        message:
          '@theatre/core may not import @theatre/studio modules except via type imports.',
      },
    ],
  },
}
