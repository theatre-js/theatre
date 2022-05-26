module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: `ImportDeclaration[importKind!='type'][source.value=/\\u002Fmain\\u002F/]`,
        message: `The extension should not be able to import the internals of main. If you need to use this API, expose it as __private_api from @theatre/r3f/src/index.ts`,
      },
    ],
  },
}
