/**
 * This script publishes the insider packages from the CI. You can't run it locally unless you have a a valid npm access token and you store its value in the `NPM_TOKEN` environmental variable.
 */

import os from 'os'
import path from 'path'

const packagesToPublish = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
]

/**
 * Receives a version number and returns it without the tags, if there are any
 *
 * @param {string} version - Version number
 * @returns Version number without the tags
 *
 * @example
 * ```javascript
 * const version_1 = '0.4.8-dev3-ec175817'
 * const version_2 = '0.4.8'
 *
 * stripTag(version_1) === stripTag(version_2) === '0.4.8' // returns `true`
 * ```
 */
function stripTag(version) {
  const regExp = /^[0-9]\.[0-9]\.[0-9]/g
  const matches = version.match(regExp)
  if (!matches) {
    throw new Error(`Version number not found in "${version}"`)
  }

  return matches[0]
}

/**
 * Creates a version number like `0.4.8-insiders.ec175817`
 *
 * @param {string} packageName - Name of the package
 * @param {string} commitHash - A commit hash
 */
function getNewVersionName(packageName, commitHash) {
  // The `r3f` package has its own release schedule, so its version numbers
  // are almost always different from the rest of the packages.
  const pathToPackageJson =
    packageName === '@theatre/r3f'
      ? path.resolve(__dirname, '..', 'packages', 'r3f', 'package.json')
      : path.resolve(__dirname, '../', './package.json')

  const jsonData = JSON.parse(
    fs.readFileSync(pathToPackageJson, {encoding: 'utf-8'}),
  )
  const strippedVersion = stripTag(jsonData.version)

  return `${strippedVersion}-insiders.${commitHash}`
}

/**
 * Assigns the new versions to the packages
 *
 * @param {{name: string, location: string}[]} workspacesListObjects - An Array of objects containing information about the workspaces
 * @param {string} latestCommitHash - Hash of the latest commit
 */
async function assignVersions(workspacesListObjects, latestCommitHash) {
  for (const workspaceData of workspacesListObjects) {
    const pathToPackage = path.resolve(
      __dirname,
      '../',
      workspaceData.location,
      './package.json',
    )

    const original = JSON.parse(
      fs.readFileSync(pathToPackage, {encoding: 'utf-8'}),
    )

    let {version, dependencies, peerDependencies, devDependencies} = original
    version = getNewVersionName(workspaceData.name, latestCommitHash)
    for (const deps of [dependencies, peerDependencies, devDependencies]) {
      if (!deps) continue
      for (const wpObject of workspacesListObjects) {
        if (deps[wpObject.name]) {
          deps[wpObject.name] = getNewVersionName(
            wpObject.name,
            latestCommitHash,
          )
        }
      }
    }
    const newJson = {
      ...original,
      version,
      dependencies,
      peerDependencies,
      devDependencies,
    }
    fs.writeFileSync(
      path.join(pathToPackage),
      JSON.stringify(newJson, undefined, 2),
      {encoding: 'utf-8'},
    )
    await $`prettier --write ${workspaceData.location + '/package.json'}`
  }
}

;(async function () {
  process.env.THEATRE_IS_PUBLISHING = true
  // In the CI `git log -1` points to a fake merge commit,
  // so we have to use the value of a special GitHub context variable
  // through the `LATEST_COMMIT_HASH` environmental variable.
  const latestCommitHash = process.env.LATEST_COMMIT_HASH.slice(0, 8)

  const workspacesListString = await $`yarn workspaces list --json`
  const workspacesListObjects = workspacesListString.stdout
    .split(os.EOL)
    .filter(Boolean)
    .map((x) => JSON.parse(x))

  await assignVersions(workspacesListObjects, latestCommitHash)

  await Promise.all(
    packagesToPublish.map((workspaceName) => {
      const npmTag = getNewVersionName(workspaceName, latestCommitHash)
      $`yarn workspace ${workspaceName} npm publish --access public --tag ${npmTag}`
    }),
  )
})()
