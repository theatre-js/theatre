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
  const regExp = /^[0-9]+\.[0-9]+\.[0-9]+/g
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
 * @returns {Promise<Record<string, string>>} - A record of {[packageId]: assignedVersion}
 */
async function assignVersions(workspacesListObjects, latestCommitHash) {
  const assignedVersionByPackageName = {}
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
    // The @theatre/r3f package curently doesn't track the same version number of the other packages like @theatre/core,
    // so we need to generate version numbers independently for each package
    version = getNewVersionName(workspaceData.name, latestCommitHash)
    assignedVersionByPackageName[workspaceData.name] = version
    // Normally we don't have to override the package versions in dependencies because yarn would already convert
    // all the "workspace:*" versions to a fixed version before publishing. However, packages like @theatre/studio
    // have a peerDependency on @theatre/core set to "*" (meaning they would work with any version of @theatre/core).
    // This is not the desired behavior in pre-release versions, so here, we'll fix those "*" versions to the set version.
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
  return assignedVersionByPackageName
}

;(async function () {
  // @ts-ignore ignore
  process.env.THEATRE_IS_PUBLISHING = true
  // In the CI `git log -1` points to a fake merge commit,
  // so we have to use the value of a special GitHub context variable
  // through the `GITHUB_SHA` environmental variable.

  // The length of the abbreviated commit hash can change, that's why we
  // need the lenght of the fake merge commit's abbreviated hash.
  const fakeMergeCommitHashLength = (await $`git log -1 --pretty=format:%h`)
    .stdout.length

  const latestCommitHash = process.env.GITHUB_SHA.slice(
    0,
    fakeMergeCommitHashLength,
  )

  const workspacesListString = await $`yarn workspaces list --json`
  const workspacesListObjects = workspacesListString.stdout
    .split(os.EOL)
    // strip out empty lines
    .filter(Boolean)
    .map((x) => JSON.parse(x))

  const assignedVersionByPackageName = await assignVersions(
    workspacesListObjects,
    latestCommitHash,
  )

  await Promise.all(
    packagesToPublish.map(async (workspaceName) => {
      const npmTag = 'insiders'
      if (process.env.GITHUB_ACTIONS) {
        await $`yarn workspace ${workspaceName} npm publish --access public --tag ${npmTag}`
      }
    }),
  )

  for (const packageName of packagesToPublish) {
    if (process.env.GITHUB_ACTIONS) {
      await $`echo ${`Published ${packageName}@${assignedVersionByPackageName[packageName]}`} >> $GITHUB_STEP_SUMMARY`
    } else {
      await $`echo ${`Published ${packageName}@${assignedVersionByPackageName[packageName]}`}`
    }
  }
})()
