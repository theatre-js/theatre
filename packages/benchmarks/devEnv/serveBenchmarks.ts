import path from 'path'
import {definedGlobals} from '../../core/devEnv/definedGlobals'

const benchmarksDir = path.join(__dirname, '..')

const port = 8087

const allEnvs = {
  '0.5.0': () => {},
}

require('esbuild')
  .serve(
    {
      port,
      servedir: path.join(benchmarksDir, 'src'),
    },
    {
      entryPoints: [path.join(benchmarksDir, 'src/index.tsx')],
      target: ['firefox88'],
      loader: {'.png': 'file', '.glb': 'file', '.svg': 'dataurl'},
      bundle: true,
      sourcemap: true,
      define: definedGlobals,
    },
  )
  .then((server: unknown) => {
    console.log('serving', 'http://localhost:' + port)
  })
