import {existsSync, writeFileSync} from 'fs'
import path from 'path'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'

const playgroundDir = path.join(__dirname, '..')

const port = 8080

const playgroundIndexContent = `
/**
 * This file is created automatically and won't be comitted to the repo.
 * You can change the import statement and import your own playground code.
 * 
 * Your own playground code should reside in './personal', which is a folder
 * that won't be committed to the repo.
 * 
 * The shared playgrounds which other contributors can use are in the './shared' folder,
 * which are comitted to the repo.
 * 
 * Happy playing!
 * */
import './shared/r3f-rocket'
`

const playgroundEntry = path.join(playgroundDir, 'src/index.ts')
if (!existsSync(playgroundEntry)) {
  writeFileSync(playgroundEntry, playgroundIndexContent, {encoding: 'utf-8'})
}

require('esbuild')
  .serve(
    {
      port,
      servedir: path.join(playgroundDir, 'src'),
    },
    {
      entryPoints: [playgroundEntry],
      target: ['firefox88'],
      loader: {
        '.png': 'file',
        '.glb': 'file',
        '.gltf': 'file',
        '.svg': 'dataurl',
      },
      bundle: true,
      sourcemap: true,
      define: definedGlobals,
    },
  )
  .then((server: unknown) => {
    console.log('Playground running at', 'http://localhost:' + port)
  })
