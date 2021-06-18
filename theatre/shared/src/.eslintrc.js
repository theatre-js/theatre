module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/@theatre\\u002F(core|studio)/]`,
        message:
          '@theatre/shared may not import @theatre/core or @theatre/studio modules except via type imports.',
      },
    ],
  },
}
