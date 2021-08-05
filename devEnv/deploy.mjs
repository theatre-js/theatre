import path from 'path'
import {writeFileSync} from 'fs'
import {keyBy} from 'lodash-es'

/**
 * This script publishes all packages to npm.
 *
 * It assigns the same version number to all packages (like lerna's fixed mode).
 **/
// It's written in .mjs because I kept running into issues with zx+typescript
const packagesToBuild = [
  'theatre',
  '@theatre/dataverse',
  '@theatre/dataverse-react',
  '@theatre/plugin-r3f',
]

const packagesToPublish = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/dataverse-react',
  '@theatre/plugin-r3f',
]

;(async function () {
  // our packages will check for this env variable to make sure their
  // prepublish script is only called from the `$ cd /path/to/monorepo; yarn run deploy`
  process.env.THEATRE_IS_PUBLISHING = true

  $.verbose = false
  const gitTags = (await $`git tag --list`).toString().split('\n')

  // const version = argv._[argv._.length - 1]
  // if (typeof version !== 'string') {
  //   console.error(
  //     `You need to specify a version, like: $ yarn deploy 1.2.0-rc.4`,
  //   )
  //   process.exit(1)
  // } else if (!version.match(/^[0-9]+\.[0-9]+\.[0-9]+(\-(dev|rc)\.[0-9])?$/)) {
  //   console.error(`Use a semver version, like 1.2.3-rc.4. Provided: ${version}`)
  //   process.exit(1)
  // }

  const allPackages = keyBy(
    (await $`yarn workspaces list --json`)
      .toString()
      .split('\n')
      .filter((s) => s.trim().length > 0)
      .map((s) => JSON.parse(s)),
    'name',
  )

  if ((await $`git status -s`).toString().length > 0) {
    console.error(`Git working directory contains uncommitted changes:`)
    $.verbose = true
    await $`git status -s`
    console.log('Commit/stash them and try again.')
    process.exit(1)
  }

  $.verbose = true
  if (argv['skip-lint'] !== true) {
    console.log('Running a typecheck and lint pass')
    await Promise.all([
      $`yarn run typecheck`,
      $`yarn run lint:all --max-warnings 0`,
    ])
  } else {
    console.log('Skipping typecheck and lint')
  }

  const [didOverwriteVersions, monorepoVersion] = syncVersionNumbers(version)

  console.log('Building all packages')
  await Promise.all(
    packagesToBuild.map(
      (workspace) => $`yarn workspace ${workspace} run build`,
    ),
  )

  console.log(
    'Checking if the build produced artifacts that must first be comitted to git',
  )
  $.verbose = false
  if ((await $`git status -s`).toString().length > 0) {
    console.error(`Git directory contains uncommitted changes.`)
    $.verbose = true
    await $`git status -s`
    process.exit(1)
  }

  $.verbose = true

  if (!gitTags.some((tag) => tag === monorepoVersion)) {
    console.log(
      `No git tag found for version "${monorepoVersion}". Run \`$ git tag ${monorepoVersion}\` and try again.`,
    )
    process.exit()
  }

  console.log('Publishing to npm')
  await Promise.all(
    packagesToPublish.map(
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

  console.log(`Syncing packages versions to ${monorepoVersion}`)

  let didOverwrite = false

  for (const packagePathRelativeFromRoot of workspaces) {
    const pathToPackage = path.resolve(
      __dirname,
      '../',
      packagePathRelativeFromRoot,
      './package.json',
    )

    const original = require(pathToPackage)

    if (original.version !== monorepoVersion) {
      didOverwrite = true
      console.log(`Setting version of ${original.name} to ${monorepoVersion}`)

      const newJson = {...original}
      newJson.version = monorepoVersion
      writeFileSync(
        path.join(pathToPackage),
        JSON.stringify(newJson, undefined, 2),
      )
    }
  }
  return [didOverwrite, monorepoVersion]
}
