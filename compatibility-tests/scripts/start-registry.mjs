import * as path from 'path'
import {YAML} from 'zx'
import {
  PATH_TO_YARNRC,
  VERDACCIO_HOST,
  VERDACCIO_URL,
  VERDACCIO_PORT,
} from './utils.mjs'
import onCleanup from 'node-cleanup'
import * as verdaccioPackage from 'verdaccio'
import {releaseToVerdaccio} from './release-to-verdaccio.mjs'

// 'verdaccio' is not an es module so we have to do this:
const startVerdaccioServer = verdaccioPackage.default.default

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
  onCleanup((exitCode, signal) => {
    onCleanup.uninstall()
    $`npm set registry ${npmOriginalRegistry}`.then(() => {
      process.kill(process.pid, signal)
    })
    return false
  })

  await $`echo "Setting npm registry url to verdaccio's"`
  await $`npm set registry ${VERDACCIO_URL}`

  await $`echo Running verdaccio on ${VERDACCIO_URL}`
  const verdaccioServer = await startVerdaccio(VERDACCIO_PORT)

  await releaseToVerdaccio()
})()

// credit: https://github.com/storybookjs/storybook/blob/92b23c080d03433765cbc7a60553d036a612a501/scripts/run-registry.ts
const startVerdaccio = (port) => {
  let resolved = false
  return Promise.race([
    new Promise((resolve) => {
      const config = {
        ...YAML.parse(
          fs.readFileSync(path.join(__dirname, '../verdaccio.yml'), 'utf8'),
        ),
      }

      const onReady = (webServer) => {
        webServer.listen(port, () => {
          resolved = true
          resolve(webServer)
        })
      }

      startVerdaccioServer(
        config,
        6000,
        undefined,
        '1.0.0',
        'verdaccio',
        onReady,
      )
    }),
    new Promise((_, rej) => {
      setTimeout(() => {
        if (!resolved) {
          resolved = true
          rej(new Error(`TIMEOUT - verdaccio didn't start within 10s`))
        }
      }, 10000)
    }),
  ])
}
