/**
 * Utility functions for the compatibility tests
 */

import path from 'path'
import {globby, YAML} from 'zx'
import onCleanup from 'node-cleanup'
import * as verdaccioPackage from 'verdaccio'

// 'verdaccio' is not an es module so we have to do this:
const startVerdaccioServer = verdaccioPackage.default.default

export const VERDACCIO_PORT = 4823
export const VERDACCIO_HOST = `localhost`
export const VERDACCIO_URL = `http://${VERDACCIO_HOST}:${VERDACCIO_PORT}/`
export const PATH_TO_COMPAT_TESTS_ROOT = path.join(__dirname, '..')
export const MONOREPO_ROOT = path.join(__dirname, '../..')
export const PATH_TO_YARNRC = path.join(MONOREPO_ROOT, '.yarnrc.yml')

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
export async function startRegistry() {
  const npmOriginalRegistry = (
    await $`npm config get registry --location=global`
  ).stdout.trim()
  onCleanup((exitCode, signal) => {
    onCleanup.uninstall()
    $`npm config set registry ${npmOriginalRegistry} --location=global`.then(
      () => {
        process.kill(process.pid, signal)
      },
    )
    return false
  })

  await $`echo "Setting npm registry url to verdaccio's"`
  await $`npm config set registry ${VERDACCIO_URL} --location=global`

  await $`echo Running verdaccio on ${VERDACCIO_URL}`
  const verdaccioServer = await startVerdaccio(VERDACCIO_PORT)

  await releaseToVerdaccio()
}

/**
 * Starts the verdaccio server and returns a promise that resolves when the serve is up and ready
 *
 * Credid: https://github.com/storybookjs/storybook/blob/92b23c080d03433765cbc7a60553d036a612a501/scripts/run-registry.ts
 */
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

const packagesToPublish = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
]

/**
 * Assigns a new version to each of @theatre/* packages. If there a package depends on another package in this monorepo,
 * this function makes sure the dependency version is fixed at "hash"
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

/**
 * Builds all the @theatre/* packages with version number 0.0.1-COMPAT.1 and publishes
 * them all to the verdaccio registry
 */
async function releaseToVerdaccio() {
  const version = '0.0.1-COMPAT.1'
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
      const npmTag = 'compat'
      await $`yarn workspace ${workspaceName} npm publish --access public --tag ${npmTag}`
    }),
  )

  restorePackages()
  restoreYarnRc()
}

/**
 * Temporarily patches the yarnrc file to sue verdaccio as its publish registry.
 *
 * Restores yarnrc to the old version when restoreYarnRc() is called.
 */
function patchYarnRcToUseVerdaccio() {
  const originalYarnrcContent = fs.readFileSync(PATH_TO_YARNRC, {
    encoding: 'utf-8',
  })

  const newYarnRcContent = YAML.stringify({
    ...YAML.parse(originalYarnrcContent),
    unsafeHttpWhitelist: [VERDACCIO_HOST],
    npmPublishRegistry: VERDACCIO_URL,
    npmAuthIdent: 'test:test',
  })

  fs.writeFileSync(PATH_TO_YARNRC, newYarnRcContent, {encoding: 'utf-8'})

  return function restoreYarnRc() {
    fs.writeFileSync(PATH_TO_YARNRC, originalYarnrcContent, {encoding: 'utf-8'})
  }
}

/**
 * Get all the setups from `./compatibility-tests/`
 *
 * @returns {Array<string>} An array containing the absolute paths to the compatibility test setups
 */
export function getCompatibilityTestSetups() {
  const buildTestsDir = path.join(MONOREPO_ROOT, 'compatibility-tests')
  let buildTestsDirEntries

  try {
    buildTestsDirEntries = fs.readdirSync(buildTestsDir)
  } catch {
    throw new Error(
      `Could not list directory: "${buildTestsDir}" Is it an existing directory?`,
    )
  }
  const setupsAbsPaths = []

  // NOTE: We assume that every directory matching `compatibility-tests/test-*` is
  // a test package
  for (const entry of buildTestsDirEntries) {
    if (!entry.startsWith('test-')) continue
    const entryAbsPath = path.join(buildTestsDir, entry)
    if (fs.lstatSync(entryAbsPath).isDirectory()) {
      setupsAbsPaths.push(entryAbsPath)
    }
  }

  return setupsAbsPaths
}

/**
 * Deletes ../test-*\/(node_modules|package-lock.json|yarn.lock)
 */
export async function clean() {
  const toDelete = await globby(
    './test-*/(node_modules|yarn.lock|package-lock.json)',
    {
      cwd: PATH_TO_COMPAT_TESTS_ROOT,
      // node_modules et al are gitignored, but we still want to clean them
      gitignore: false,
      // include directories too
      onlyFiles: false,
    },
  )
  toDelete.forEach((fileOrDir) => {
    console.log('deleting', fileOrDir)
    fs.removeSync(path.join(PATH_TO_COMPAT_TESTS_ROOT, fileOrDir))
  })
}
