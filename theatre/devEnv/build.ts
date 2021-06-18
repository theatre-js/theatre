import path from 'path'
import {definedGlobals} from './buildUtils'

for (const which of ['core', 'studio']) {
  const pathToPackage = path.join(__dirname, '../', which)
  const esbuildConfig = {
    entryPoints: [path.join(pathToPackage, 'src/index.ts')],
    target: ['firefox88'],
    loader: {'.png': 'file'},
    outfile: path.join(pathToPackage, 'dist/index.js'),
    bundle: true,
    sourcemap: true,
    define: definedGlobals,
  }
  require('esbuild').build(esbuildConfig)
}
