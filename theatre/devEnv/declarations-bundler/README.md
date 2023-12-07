## Bundling typescript declarations

The stuff in this folder are responsible for producing the `.d.ts` declaration
files in `lib/`.

Declarations are produced in two steps:

1. (`$ npm run build:declarations:emit`): `$ tsc` is run with
   `tsconfig.declarations.json`. This produces a `.d.ts` file for every module
   in the project and emits them to `.temp/`.
2. (`$ npm run build:declarations:bundle`): We then use rollup with
   [rollup-plugin-flat-dts](https://github.com/run-z/rollup-plugin-flat-dts) to bundle
   the declaration files into a concise bundle.
