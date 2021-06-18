import path from 'path'
import {
  convertObjectToWebpackDefinePaths,
  getEnvConfig,
} from '../../../theatre/devEnv/webpack/createWebpackConfig'

const playgroundDir = path.join(__dirname, '..')

const envConfig = getEnvConfig(true)

const port = 8080

require('esbuild')
  .serve(
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
        '$env.isCore': false,
        ...convertObjectToWebpackDefinePaths({
          process: {env: envConfig},
          $env: envConfig,
        }),
      },
    },
  )
  .then((server: unknown) => {
    console.log('serving', 'http://localhost:' + port)
  })
