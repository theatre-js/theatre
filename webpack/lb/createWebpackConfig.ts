import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'
import * as path from 'path'
import * as webpack from 'webpack'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  // We set this manually to make it available to external modules imported in lf
  process.env.NODE_ENV = env

  const parts = makeConfigParts({
    env,
    withReactHotLoading: false,
    packageName: 'lb',
    withDevServer: false,
    entries: {
      index: ['./src/lb/index.tsx'],
    },
    withServerSideHotLoading: false,
  })

  const customized = immer(parts.config, c => {
    c.target = 'electron-main'
    // c.recordsPath = path.join(parts.bundlesDir, '.temp/records')
    c.output.libraryTarget = 'commonjs2'
    c.output.publicPath = './bundles/lb/'
    c.node = {
      __dirname: true,
      __filename: true,
    }
    // c.externals = [/^[a-zA-Z0-9\@]+/]
    c.externals = (_: {}, request: any, callback: any) => {
      if (request.match(/webpack\/hot\/poll/)) {
        callback(null, false)
      } else {
        callback(null, !!request.match(/^[a-zA-Z\-@0-9]+[^!]*$/))
      }
    }
    // c.plugins.push(new webpack.HotModuleReplacementPlugin())
  })

  return customized
}
