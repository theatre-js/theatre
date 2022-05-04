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
