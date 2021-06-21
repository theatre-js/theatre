import path from 'path'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'

const playgroundDir = path.join(__dirname, '..')

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
      bundle: true,
      sourcemap: true,
      define: definedGlobals,
    },
  )
  .then((server: unknown) => {
    console.log('serving', 'http://localhost:' + port)
  })
