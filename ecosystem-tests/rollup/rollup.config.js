// @ts-check
import {defineConfig} from 'rollup'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import common from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import {terser} from 'rollup-plugin-terser'

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
  console.error(`Set NODE_ENV to ${process.env.NODE_ENV} as default`)
}

const production = process.env.NODE_ENV === 'production'

// See https://rollupjs.org/guide/en/#options
export default defineConfig({
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    // format: "es",
    sourcemap: true,
  },
  plugins: [
    common(), // detect CommonJS modules
    json(), // import json
    resolve(), // use node_modules
    // Rollup does not replace process.env.NODE_ENV
    // with the value of the `NODE_ENV` environmental variable
    // during build by deafult, so we must use the `replace` plugin.
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    production && terser(), // minify, but only in production
  ],
})
