import path from 'path'
import {definedGlobals} from './buildUtils'

for (const which of ['core', 'studio']) {
  const pathToPackage = path.join(__dirname, '../', which)
  const esbuildConfig = {
    entryPoints: [path.join(pathToPackage, 'src/index.ts')],
    target: ['firefox88', 'chrome90'],
    loader: {'.png': 'file'},
    outfile: path.join(pathToPackage, 'dist/index.js'),
    bundle: true,
    sourcemap: true,
    define: definedGlobals,
  }
  if (which === 'core') {
    esbuildConfig.target = ['firefox57', 'chrome58']
  }
  require('esbuild').build(esbuildConfig)
}
