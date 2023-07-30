/**
 * Utility functions for the compatibility tests
 */

import prettier from 'prettier'
import path from 'path'
import {globby, argv, YAML, $, fs, cd, os, within} from 'zx'
import onCleanup from 'node-cleanup'
import * as verdaccioPackage from 'verdaccio'
import {chromium, devices} from 'playwright'

/**
 * @param {string} pkg
 * @returns boolean
 */
const isTheatreDependency = (pkg) =>
  pkg.startsWith('@theatre/') || pkg === 'theatric'

const verbose = !!argv['verbose']

if (!verbose) {
  $.verbose = false
  console.log(
    'Running in quiet mode. Add --verbose to see the output of all commands.',
  )
}

// 'verdaccio' is not an es module so we have to do this:
// @ts-ignore
const startVerdaccioServer = verdaccioPackage.default.default

const config = {
  VERDACCIO_PORT: 4823,
  VERDACCIO_HOST: `localhost`,
  get VERDACCIO_URL() {
    return `http://${config.VERDACCIO_HOST}:${config.VERDACCIO_PORT}/`
  },
  PATH_TO_COMPAT_TESTS_ROOT: path.join(__dirname, '..'),
  MONOREPO_ROOT: path.join(__dirname, '../..'),
}

/**
 * Set environment variables so that yarn and npm use verdaccio as the registry.
 * These are only set for the current process.
 */
process.env.YARN_NPM_PUBLISH_REGISTRY = config.VERDACCIO_URL
process.env.YARN_UNSAFE_HTTP_WHITELIST = config.VERDACCIO_HOST
process.env.YARN_NPM_AUTH_IDENT = 'test:test'
process.env.NPM_CONFIG_REGISTRY = config.VERDACCIO_URL

const tempVersion =
  '0.0.1-COMPAT.' +
  // a random integer between 1 and 50000
  (Math.floor(Math.random() * 50000) + 1).toString()

/**
 * This script starts verdaccio and publishes all the packages in the monorepo to it, then
 * it runs `npm install` on all the test packages, and finally it closes verdaccio.
 */
export async function installFixtures() {
  onCleanup((exitCode, signal) => {
    onCleanup.uninstall()
    restoreTestPackageJsons()
    process.kill(process.pid, signal)
    return false
  })

  console.log('Using temporary version: ' + tempVersion)
  console.log('Patching package.json files in ./test-*')
  const restoreTestPackageJsons = await patchTestPackageJsons()

  console.log('Starting verdaccio')
  const verdaccioServer = await startVerdaccio(config.VERDACCIO_PORT)
  console.log(`Verdaccio is running on ${config.VERDACCIO_URL}`)

  console.log('Releasing @theatre/* packages to verdaccio')
  await releaseToVerdaccio()

  console.log('Running `$ npm install` on test packages')
  await runNpmInstallOnTestPackages()
  console.log('All fixtures installed successfully')
  await verdaccioServer.close()
  restoreTestPackageJsons()
  console.log('Done')
}

async function runNpmInstallOnTestPackages() {
  const packagePaths = await getCompatibilityTestSetups()

  for (const pathToPackageDir of packagePaths) {
    cd(pathToPackageDir)
    try {
      console.log('Running npm install on ' + pathToPackageDir + '...')
      await $`npm install --registry ${config.VERDACCIO_URL} --loglevel ${
        verbose ? 'warn' : 'error'
      } --fund false`
    } catch (error) {
      console.error(`Failed to install dependencies for ${pathToPackageDir}
Try running \`npm install\` in that directory manually via:
cd ${pathToPackageDir}
npm install --registry ${config.VERDACCIO_URL}
Original error: ${error}`)
    }
  }
}

/**
 * Takes an absolute path to a package.json file and replaces all of its
 * dependencies on `@theatre/*` packatges to `version`.
 *
 * @param {string} pathToPackageJson absolute path to the package.json file
 * @param {string} version The version to set all `@theatre/*` dependencies to
 */
async function patchTheatreDependencies(pathToPackageJson, version) {
  const originalFileContent = fs.readFileSync(pathToPackageJson, {
    encoding: 'utf-8',
  })
  // get the package.json file's content
  const packageJson = JSON.parse(originalFileContent)

  // find all dependencies on '@theatre/*' packages and replace them with the local version
  for (const dependencyType of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ]) {
    const dependencies = packageJson[dependencyType]
    if (dependencies) {
      for (const dependencyName of Object.keys(dependencies)) {
        if (isTheatreDependency(dependencyName)) {
          dependencies[dependencyName] = version
        }
      }
    }
  }
  // run the json through prettier
  const jsonStringPrettified = prettier.format(
    JSON.stringify(packageJson, null, 2),
    {
      parser: 'json',
      filepath: pathToPackageJson,
    },
  )

  // write the modified package.json file
  fs.writeFileSync(pathToPackageJson, jsonStringPrettified, {encoding: 'utf-8'})
}

async function patchTestPackageJsons() {
  const packagePaths = (await getCompatibilityTestSetups()).map(
    (pathToPackageDir) => path.join(pathToPackageDir, 'package.json'),
  )

  // replace all dependencies on @theatre/* packages with the local version
  for (const pathToPackageJson of packagePaths) {
    patchTheatreDependencies(pathToPackageJson, tempVersion)
  }

  return () => {
    // replace all dependencies on @theatre/* packages with the 0.0.1-COMPAT.1
    for (const pathToPackageJson of packagePaths) {
      patchTheatreDependencies(pathToPackageJson, '0.0.1-COMPAT.1')
    }
  }
}

/**
 * Starts the verdaccio server and returns a promise that resolves when the serve is up and ready
 *
 * Credit: https://github.com/storybookjs/storybook/blob/92b23c080d03433765cbc7a60553d036a612a501/scripts/run-registry.ts
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

      if (verbose) {
        config.logs.level = 'warn'
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
  'theatric',
]

/**
 * Assigns a new version to each of @theatre/* packages. If there a package depends on another package in this monorepo,
 * this function makes sure the dependency version is fixed at "version"
 *
 * @param {{name: string, location: string}[]} workspacesListObjects - An Array of objects containing information about the workspaces
 * @param {string} version - Version of the latest commit (or any other string)
 * @returns {Promise<() => void>} - An async function that restores the package.json files to their original version
 */
async function writeVersionsToPackageJSONs(workspacesListObjects, version) {
  /**
   * An array of functions each of which restores a certain package.json to its original state
   * @type {Array<() => void>}
   */
  const restores = []
  for (const workspaceData of workspacesListObjects) {
    const pathToPackage = path.resolve(
      config.MONOREPO_ROOT,
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

    // Normally we don't have to override the package versions in dependencies because yarn would already convert
    // all the "workspace:*" versions to a fixed version before publishing. However, packages like @theatre/studio
    // have a peerDependency on @theatre/core set to "*" (meaning they would work with any version of @theatre/core).
    // This is not the desired behavior in pre-release versions, so here, we'll fix those "*" versions to the set version.
    for (const deps of [dependencies, peerDependencies, devDependencies]) {
      if (!deps) continue
      for (const wpObject of workspacesListObjects) {
        if (deps[wpObject.name]) {
          deps[wpObject.name] = version
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
  cd(config.MONOREPO_ROOT)

  // @ts-ignore ignore
  process.env.THEATRE_IS_PUBLISHING = true

  const workspacesListString = await $`yarn workspaces list --json`
  const workspacesListObjects = workspacesListString.stdout
    .split(os.EOL)
    // strip out empty lines
    .filter(Boolean)
    .map((x) => JSON.parse(x))

  const restorePackages = await writeVersionsToPackageJSONs(
    workspacesListObjects,
    tempVersion,
  )

  // Restore the package.json files to their original state when the process is killed
  process.on('SIGINT', async function cleanup(a) {
    restorePackages()
  })

  try {
    await $`yarn clean`
    await $`yarn build`

    await Promise.all(
      packagesToPublish.map(async (workspaceName) => {
        const npmTag = 'compat'
        await $`yarn workspace ${workspaceName} npm publish --access public --tag ${npmTag}`
      }),
    )
  } finally {
    restorePackages()
  }
}

/**
 * Get all the setups from `./compat-tests/`
 *
 * @returns {Promise<Array<string>>} An array containing the absolute paths to the compatibility test setups
 */
export async function getCompatibilityTestSetups() {
  const fixturePackageJsonFiles = await globby(
    './fixtures/*/package/package.json',
    {
      cwd: config.PATH_TO_COMPAT_TESTS_ROOT,
      gitignore: false,
      onlyFiles: true,
    },
  )

  return fixturePackageJsonFiles.map((entry) => {
    return path.join(config.PATH_TO_COMPAT_TESTS_ROOT, entry, '../')
  })
}

/**
 * Deletes ../test-*\/(node_modules|package-lock.json|yarn.lock)
 */
export async function clean() {
  const toDelete = await globby(
    './fixtures/*/package/(node_modules|yarn.lock|package-lock.json)',
    {
      cwd: config.PATH_TO_COMPAT_TESTS_ROOT,
      // node_modules et al are gitignored, but we still want to clean them
      gitignore: false,
      // include directories too
      onlyFiles: false,
    },
  )

  return await Promise.all(
    toDelete.map((fileOrDir) => {
      console.log('deleting', fileOrDir)
      return fs.remove(path.join(config.PATH_TO_COMPAT_TESTS_ROOT, fileOrDir))
    }),
  )
}
