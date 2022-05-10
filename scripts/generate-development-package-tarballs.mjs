/**
 * This script generates tarballs from the theatre packages and publish them.
 */

import os from 'os'
import path from 'path'

const packagesToPack = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
]

/**
  * Creates a name for the tarball of the package
  *
  * @param {string} workspaceName - Name of the workspace
  * @param {string} version - Version number of the package
  */
function createTarballName(workspaceName, commitHash) {
  const [_, packageName] = workspaceName.split('/')

  return `${packageName}-${commitHash}.tgz`
}

/**
 * Generates a tarball for a workspace and publishes it
 *
 * @param {string} workspace - Name of the workspace
 * @param {string} latestCommitHash - Abbreviated hash of the latest commit
 * @param {{location: string, name: string}[]} workspacesListObjects - Objects containing the paths to the workspaces
 */
async function generateAndPublishTarball(
  workspace,
  latestCommitHash,
  workspacesListObjects,
) {
  const tarballName = createTarballName(workspace, latestCommitHash)
  const pathToTarball = path.join(
    __dirname,
    '..',
    workspacesListObjects.filter((wp) => {
      return wp.name === workspace
    })[0].location,
    tarballName,
  )
  await $`yarn workspace ${workspace} pack --filename ${tarballName}`
  await $`DO_TARBALL_PATH=${pathToTarball} node scripts/dev-package-uploader/publish-package.js`
}

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
function createNewVersion(packageName, commitHash) {
  // The `r3f` package has its own release schedule, so its version numbers
  // are almost always different from the rest of the packages.
  const pathToPackageJson = packageName === '@theatre/r3f' ?
    path.resolve(__dirname, '..', 'packages', 'r3f', 'package.json') :
    path.resolve(__dirname, '../', './package.json')

  const jsonData = JSON.parse(
    fs.readFileSync(pathToPackageJson, { encoding: 'utf-8' }),
  )
  const strippedVersion = stripTag(jsonData.version)

  return `${strippedVersion}-insiders.${commitHash}`
}

/**
  * Assigns versions to the packages
  *
  * @param {{name: string, location: string}[]} workspacesListObjects - An Array of objects containing information about the workspaces
  * @param {string} latestCommitHash - Hash of the latest commit
  */
async function assignVersions(
  workspacesListObjects,
  latestCommitHash,
) {
  for (const wpData of workspacesListObjects) {
    const pathToPackage = path.resolve(
      __dirname,
      '../',
      wpData.location,
      './package.json',
    )

    const original = JSON.parse(
      fs.readFileSync(pathToPackage, { encoding: 'utf-8' }),
    )

    let { version, dependencies, peerDependencies, devDependencies } = original
    for (const deps of [dependencies, peerDependencies, devDependencies]) {
      if (!deps) continue
      for (let wpObject of workspacesListObjects) {
        if (deps[wpObject.name]) {
          const tarballName = createTarballName(wpObject.name, latestCommitHash)
          const { DO_BUCKET, DO_REGION, DO_DOMAIN } = process.env
          const domain =
            DO_DOMAIN || `${DO_BUCKET}.${DO_REGION}.cdn.digitaloceanspaces.com`
          deps[wpObject.name] = `https://${domain}/@theatre/${tarballName}`
        }
      }
    }
    version = createNewVersion(wpData.name, latestCommitHash)
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
      { encoding: 'utf-8' },
    )
    await $`prettier --write ${wpData.location + '/package.json'}`
  }
}

; (async function() {
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

  await assignVersions(
    workspacesListObjects,
    latestCommitHash,
  )

  await Promise.all(
    packagesToPack.map((workspace) => {
      generateAndPublishTarball(
        workspace,
        latestCommitHash,
        workspacesListObjects,
      )
    }),
  )
})()
