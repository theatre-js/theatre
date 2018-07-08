import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: true,
    packageName: 'examples',
    withDevServer: true,
    entries: {
      'studio/1': ['./examples/studio/1/index.js'],
      'tl/1': ['./examples/tl/1/index.js'],
    },
  })

  return immer(parts.config, c => {
    // we got multiple entries with the same name, so let's use [id] here
    c.output.filename = '[id].js'
    c.plugins.push(
      // new HtmlWebpackPlugin({
      //   inject: 'body',
      //   template: './examples/index.html',
      //   filename: 'index.html',
      //   chunks: [],
      // }),
      new HtmlWebpackPlugin({
        inject: false,
        template: './examples/studio/1/index.html',
        filename: 'studio/1/index.html',
        chunks: ['studio/1'],
        templateParameters: parts.htmlPluginTemplateParameters,
      }),
      // new HtmlWebpackPlugin({
      //   inject: 'body',
      //   template: './examples/tl/1/index.html',
      //   filename: 'tl/1/index.html',
      //   chunks: ['tl/1'],
      // }),
    )
  })
}
