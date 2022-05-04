/**
 * Generate tarballs from the theatre packages and publish them.
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
 * Generate the tarball for a workspace and publish it
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
  const tarballName = `${workspace
    // Get rid of the "@"
    .slice(1)
    // Replace the "/" with "-"
    .replace('/', '-')}-${latestCommitHash}.tgz`
  const pathToTarball = path.join(
    __dirname,
    '..',
    workspacesListObjects.filter((wp) => {
      return wp.name === workspace
    })[0].location,
    tarballName,
  )
  await $`yarn workspace ${workspace} pack --filename ${tarballName}`
  await $`TARBALL_PATH=${pathToTarball} node scripts/dev-package-uploader/publish-package.js`
}

//TODO: add jsDoc/reuse the function from `./release.mjs` (that script must be refactored for this)
async function assignVersions(monorepoVersion, packagesWhoseVersionShouldBump) {
  for (const packagePathRelativeFromRoot of packagesWhoseVersionShouldBump) {
    const pathToPackage = path.resolve(
      __dirname,
      '../',
      packagePathRelativeFromRoot,
      './package.json',
    )

    const original = JSON.parse(
      fs.readFileSync(pathToPackage, {encoding: 'utf-8'}),
    )

    const newJson = {...original, version: monorepoVersion}
    fs.writeFileSync(
      path.join(pathToPackage),
      JSON.stringify(newJson, undefined, 2),
      {encoding: 'utf-8'},
    )
    await $`prettier --write ${packagePathRelativeFromRoot + '/package.json'}`
  }
}

;(async function () {
  process.env.THEATRE_IS_PUBLISHING = true
  // TODO: Bump up the version `zx` to be able to use the `quiet()` function
  // that prevents the output of the `git log` command to be printed to the terminal
  const latestCommitHash = await $`git log -1 --pretty=format:%h`

  const workspacesListString = await $`yarn workspaces list --json`
  const workspacesListObjects = workspacesListString.stdout
    .split(os.EOL)
    .filter(Boolean)
    .map((x) => JSON.parse(x))

  // TODO: replace the dependency versions with the commit hash in the packages
  await assignVersions(
    latestCommitHash.stdout,
    workspacesListObjects.map((wpData) => wpData.location),
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
