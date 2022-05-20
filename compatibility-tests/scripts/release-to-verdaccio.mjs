/**
 * This script publishes the insider packages from the CI. You can't run it locally unless you have a a valid npm access token and you store its value in the `NPM_TOKEN` environmental variable.
 */

import os from 'os'
import path from 'path'
import {YAML} from 'zx'
import {MONOREPO_ROOT} from './utils.mjs'
import {PATH_TO_YARNRC, VERDACCIO_URL, VERDACCIO_HOST} from './utils.mjs'

const packagesToPublish = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
]

/**
 * Assigns the new versions to the packages
 *
 * @param {{name: string, location: string}[]} workspacesListObjects - An Array of objects containing information about the workspaces
 * @param {string} hash - Hash of the latest commit (or any other string)
 * @returns {Promise<() => void>} - An async function that restores the package.json files to their original version
 */
async function assignVersions(workspacesListObjects, hash) {
  /**
   * An array of functions each of which restores a certain package.json to its original state
   * @type {Array<() => void>}
   */
  const restores = []
  for (const workspaceData of workspacesListObjects) {
    const pathToPackage = path.resolve(
      MONOREPO_ROOT,
      workspaceData.location,
      './package.json',
    )

    const originalFileContent = fs.readFileSync(pathToPackage, {
      encoding: 'utf-8',
    })
    const originalJson = JSON.parse(originalFileContent)

    restores.push(() => {
      fs.writeFileSync(pathToPackage, originalFileContent, {encoding: 'utf-8'})
    })

    let {dependencies, peerDependencies, devDependencies} = originalJson
    // The @theatre/r3f package curently doesn't track the same version number of the other packages like @theatre/core,
    // so we need to generate version numbers independently for each package
    const version = hash

    // Normally we don't have to override the package versions in dependencies because yarn would already convert
    // all the "workspace:*" versions to a fixed version before publishing. However, packages like @theatre/studio
    // have a peerDependency on @theatre/core set to "*" (meaning they would work with any version of @theatre/core).
    // This is not the desired behavior in pre-release versions, so here, we'll fix those "*" versions to the set version.
    for (const deps of [dependencies, peerDependencies, devDependencies]) {
      if (!deps) continue
      for (const wpObject of workspacesListObjects) {
        if (deps[wpObject.name]) {
          deps[wpObject.name] = hash
        }
      }
    }
    const newJson = {
      ...originalJson,
      version,
      dependencies,
      peerDependencies,
      devDependencies,
    }
    fs.writeFileSync(pathToPackage, JSON.stringify(newJson, undefined, 2), {
      encoding: 'utf-8',
    })
  }
  return () =>
    restores.forEach((fn) => {
      fn()
    })
}

export async function releaseToVerdaccio() {
  const version = '0.0.1-COMPATIBILITY.' + '1' //Math.floor(Math.random() * 1000000)
  cd(MONOREPO_ROOT)

  // @ts-ignore ignore
  process.env.THEATRE_IS_PUBLISHING = true

  const workspacesListString = await $`yarn workspaces list --json`
  const workspacesListObjects = workspacesListString.stdout
    .split(os.EOL)
    // strip out empty lines
    .filter(Boolean)
    .map((x) => JSON.parse(x))

  const restorePackages = await assignVersions(workspacesListObjects, version)

  process.on('SIGINT', async function cleanup(a) {
    restorePackages()
    process.exit(0)
  })

  // set verdaccio as the publish registry, and add it to the whitelist
  const restoreYarnRc = patchYarnRcToUseVerdaccio()

  await $`yarn clean`
  await $`yarn build`

  await Promise.all(
    packagesToPublish.map(async (workspaceName) => {
      const npmTag = 'compatibility'
      await $`yarn workspace ${workspaceName} npm publish --access public --tag ${npmTag}`
    }),
  )

  restorePackages()
  restoreYarnRc()
}

function patchYarnRcToUseVerdaccio() {
  const originalYarnrcContent = fs.readFileSync(PATH_TO_YARNRC, {
    encoding: 'utf-8',
  })

  const newYarnRcContent = YAML.stringify({
    ...YAML.parse(originalYarnrcContent),
    unsafeHttpWhitelist: [VERDACCIO_HOST],
    npmPublishRegistry: VERDACCIO_URL,
  })

  fs.writeFileSync(PATH_TO_YARNRC, newYarnRcContent, {encoding: 'utf-8'})

  return function restoreYarnRc() {
    fs.writeFileSync(PATH_TO_YARNRC, originalYarnrcContent, {encoding: 'utf-8'})
  }
}
