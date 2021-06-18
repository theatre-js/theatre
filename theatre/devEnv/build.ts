import path from 'path'
import {
  convertObjectToWebpackDefinePaths,
  getEnvConfig,
} from './webpack/createWebpackConfig'

const playgroundDir = path.join(__dirname, '..')

const envConfig = getEnvConfig(true)

require('esbuild').serve(
  {
    port,
    servedir: path.join(playgroundDir, 'src'),
  },
  {
    entryPoints: [path.join(playgroundDir, 'src/index.tsx')],
    target: ['firefox88'],
    loader: {'.png': 'file'},
    // outdir: '.',
    // watch: true,
    bundle: true,
    sourcemap: true,
    define: {
      global: 'window',
      ...convertObjectToWebpackDefinePaths({
        process: {env: envConfig},
        'process.env': envConfig,
      }),
    },
  },
)
