import * as path from 'path'
import {YAML} from 'zx'

const VERDACCIO_PORT = 4823
const VERDACCIO_HOST = `localhost`
const VERDACCIO_URL = `http://${VERDACCIO_HOST}:${VERDACCIO_PORT}/`

const MONOREPO_ROOT = path.join(__dirname, '../..')
const PATH_TO_YARNRC = path.join(MONOREPO_ROOT, '.yarnrc.yml')

/**
 * This script will:
 *  1. Start verdaccio (a local npm registry),
 *  2. Configure npm (and _not_ yarn) to use verdaccio as its registry
 *  3. Configure the yarn instance of the monorepo to publish `@theatre/*`
 *     packages to verdaccio, but not to use verdaccio as a registry to fetch
 *     existing packages.
 *  4. It will _not_ affect the global yarn installation yet. That is a TODO
 *
 * If the script is interrupted, it'll attempt to restore the npm/yarn
 * registry config to its original state, but that's not guaranteed.
 */
;(async function () {
  const npmOriginalRegistry = (await $`npm get registry`).stdout.trim()
  const originalYarnrcContent = fs.readFileSync(PATH_TO_YARNRC, {
    encoding: 'utf-8',
  })

  process.on('SIGINT', async function cleanup(a) {
    fs.writeFileSync(PATH_TO_YARNRC, originalYarnrcContent, {encoding: 'utf-8'})
    await $`npm set registry ${npmOriginalRegistry}`

    process.exit(0)
  })

  await $`echo "Setting npm registry url to verdaccio's"`
  await $`npm set registry ${VERDACCIO_URL}`
  // set verdaccio as the publish registry, and add it to the whitelist
  const newYarnRcContent = YAML.stringify({
    ...YAML.parse(originalYarnrcContent),
    unsafeHttpWhitelist: [VERDACCIO_HOST],
    npmPublishRegistry: VERDACCIO_URL,
  })

  fs.writeFileSync(PATH_TO_YARNRC, newYarnRcContent, {encoding: 'utf-8'})

  await $`echo Running verdaccio on ${VERDACCIO_URL}`
  await $`yarn verdaccio -l ${VERDACCIO_PORT} -c ./verdaccio.yml`
})()
