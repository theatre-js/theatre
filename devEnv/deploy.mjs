import path from 'path'
import {writeFileSync} from 'fs'

/**
 * This script publishes all packages to npm.
 *
 * It assigns the same version number to all packages (like lerna's fixed mode).
 **/
// It's written in .mjs because I kept running into issues with zx+typescript
;(async function () {
  // our packages will check for this env variable to make sure their
  // prepublish script is only called from the `$ cd /path/to/monorepo; yarn run deploy`
  process.env.THEATRE_IS_PUBLISHING = true

  await $`yarn run typecheck`

  syncVersionNumbers()

  return

  await Promise.all(
    [
      'theatre',
      '@theatre/dataverse',
      '@theatre/dataverse-react',
      '@theatre/plugin-r3f',
    ].map((workspace) => $`yarn workspace ${workspace} run build`),
  )

  await Promise.all(
    [
      '@theatre/core',
      '@theatre/studio',
      '@theatre/dataverse',
      '@theatre/dataverse-react',
      '@theatre/plugin-r3f',
    ].map(
      (workspace) => $`yarn workspace ${workspace} npm publish --access public`,
    ),
  )
})()

function syncVersionNumbers() {
  /**
   * All these packages will have the same version from monorepo/package.json
   */
  const workspaces = [
    'theatre',
    'theatre/core',
    'theatre/studio',
    'packages/dataverse',
    'packages/dataverse-react',
    'packages/plugin-r3f',
  ]

  const monorepoVersion = require('../package.json').version

  console.log(
    `sync-versions: Setting versions of all packages to ${monorepoVersion}`,
  )

  for (const packagePathRelativeFromRoot of workspaces) {
    const pathToPackage = path.resolve(
      __dirname,
      '../',
      packagePathRelativeFromRoot,
      './package.json',
    )

    const original = require(pathToPackage)

    if (original.version !== monorepoVersion) {
      console.log(`Setting version of ${original.name} to ${monorepoVersion}`)

      const newJson = {...original}
      newJson.version = monorepoVersion
      writeFileSync(
        path.join(pathToPackage),
        JSON.stringify(newJson, undefined, 2),
      )
    }
  }
  console.log('sync-versions: Done.')
}
