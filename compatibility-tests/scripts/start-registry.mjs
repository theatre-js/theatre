import * as path from 'path'
import {YAML} from 'zx'
import {
  PATH_TO_YARNRC,
  VERDACCIO_HOST,
  VERDACCIO_URL,
  VERDACCIO_PORT,
} from './utils.mjs'

/**
 * This script will:
 *  1. Start verdaccio (a local npm registry),
 *  2. Configure npm (and _not_ yarn) to use verdaccio as its registry
 *  3. It will _not_ affect the global yarn installation yet. That is a TODO
 *  4. It does _not_ affect the monorepo yarnrc file.
 *
 * If the script is interrupted, it'll attempt to restore the npm/yarn
 * registry config to its original state, but that's not guaranteed.
 */
;(async function () {
  const npmOriginalRegistry = (await $`npm get registry`).stdout.trim()
  process.on('SIGINT', async function cleanup(a) {
    await $`npm set registry ${npmOriginalRegistry}`
    process.exit(0)
  })

  await $`echo "Setting npm registry url to verdaccio's"`
  await $`npm set registry ${VERDACCIO_URL}`

  await $`echo Running verdaccio on ${VERDACCIO_URL}`
  await $`yarn verdaccio -l ${VERDACCIO_PORT} -c ./verdaccio.yml`
})()
