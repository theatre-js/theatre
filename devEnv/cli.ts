import sade from 'sade'
import {$, fs, path, question} from '@cspotcode/zx'
import * as core from '@actions/core'
import * as os from 'os'

const root = path.join(__dirname, '..')

const prog = sade('cli').describe('CLI for Theatre.js development')

// better quote function from https://github.com/google/zx/pull/167
$.quote = function quote(arg) {
  if (/^[a-z0-9/_.-]+$/i.test(arg)) {
    return arg
  }
  return (
    `$'` +
    arg
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\f/g, '\\f')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\v/g, '\\v')
      .replace(/\0/g, '\\0') +
    `'`
  )
}

const packagesToBuild = [
  '@theatre/saaz',
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
  'theatric',
]

prog
  .command(
    'build clean',
    'Cleans the build artifacts and output directories of all the main packages',
  )
  .action(async () => {
    const packages = [...packagesToBuild]

    await Promise.all([
      ...packages.map((workspace) => $`yarn workspace ${workspace} run clean`),
    ])
  })

prog.command('build', 'Builds all the main packages').action(async () => {
  async function build() {
    await Promise.all([
      $`yarn run build:ts`,
      ...packagesToBuild
        // let's skip the browser bundles package, becuase it depends on other packages being built first
        .filter((s) => s !== '@theatre/browser-bundles')
        .map((workspace) => $`yarn workspace ${workspace} run build`),
    ])
    await $`yarn workspace @theatre/browser-bundles run build`
  }

  void build()
})

prog
  .command('release <version>', 'Releases all the main packages to npm')
  .option('--skip-ts', 'Skip emitting typescript declarations')
  .option('--skip-lint', 'Skip typecheck and lint')
  .action(async (version, opts) => {
    /**
     * This script publishes all packages to npm.
     *
     * It assigns the same version number to all packages (like lerna's fixed mode).
     **/

    const packagesToPublish = [...packagesToBuild]

    /**
     * All these packages will have the same version from monorepo/package.json
     */
    const packagesWhoseVersionsShouldBump = ['.', ...packagesToPublish]

    // our packages will check for this env variable to make sure their
    // prepublish script is only called from the `$ cd /path/to/monorepo; yarn run release`
    // @ts-ignore ignore
    process.env.THEATRE_IS_PUBLISHING = true

    async function release() {
      $.verbose = false
      const gitTags = (await $`git tag --list`).toString().split('\n')

      if (typeof version !== 'string') {
        console.error(
          `You need to specify a version, like: $ yarn cli release 1.2.0-rc.4`,
        )
        process.exit(1)
      } else if (
        !version.match(/^[0-9]+\.[0-9]+\.[0-9]+(\-(dev|rc)\.[0-9]+)?$/)
      ) {
        console.error(
          `Use a semver version, like 1.2.3-rc.4. Provided: ${version}`,
        )
        process.exit(1)
      }

      const previousVersion = require('../package.json').version

      if (version === previousVersion) {
        console.error(
          `Version ${version} is already assigned to root/package.json`,
        )
        process.exit(1)
      }

      if (gitTags.some((tag) => tag === version)) {
        console.error(`There is already a git tag for version ${version}`)
        process.exit(1)
      }

      let npmTag = 'latest'
      if (version.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)) {
        console.log('npm tag: latest')
      } else {
        const matches = version.match(
          /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\-(dev|rc|beta)\.[0-9]{1,3}$/,
        )
        if (!matches) {
          console.log(
            'Invalid version. Currently xx.xx.xx or xx.xx.xx-(dev|rc|beta).xx is allowed',
          )
          process.exit(1)
        }
        npmTag = matches[1]
        console.log('npm tag: ' + npmTag)
      }

      if ((await $`git status -s`).toString().length > 0) {
        console.error(`Git working directory contains uncommitted changes:`)
        $.verbose = true
        await $`git status -s`
        console.log('Commit/stash them and try again.')
        process.exit(1)
      }

      $.verbose = true
      if (opts['skip-lint'] !== true) {
        console.log('Running a typecheck and lint pass')
        await Promise.all([$`yarn run typecheck`, $`yarn run lint:all`])
      } else {
        console.log('Skipping typecheck and lint')
      }

      const skipTypescriptEmit = opts['skip-ts'] === true

      console.log('Assigning versions')
      await writeVersionsToPackageJSONs(version)

      console.log('Building all packages')
      await Promise.all(
        packagesToBuild.map((workspace) =>
          skipTypescriptEmit
            ? $`yarn workspace ${workspace} run build:js`
            : $`yarn workspace ${workspace} run build`,
        ),
      )

      // temporarily rolling back the version assignments to make sure they don't show
      // up in `$ git status`. (would've been better to just ignore hese particular changes
      // but i'm lazy)
      await restoreVersions()

      console.log(
        'Checking if the build produced artifacts that must first be comitted to git',
      )
      $.verbose = false
      if ((await $`git status -s`).toString().length > 0) {
        $.verbose = true
        await $`git status -s`
        console.error(`Git directory contains uncommitted changes.`)
        process.exit(1)
      }

      $.verbose = true

      await writeVersionsToPackageJSONs(version)

      console.log('Committing/tagging')

      await $`git add .`
      await $`git commit -m ${version}`
      await $`git tag ${version}`

      // if (!gitTags.some((tag) => tag === version)) {
      //   console.log(
      //     `No git tag found for version "${version}". Run \`$ git tag ${version}\` and try again.`,
      //   )
      //   process.exit()
      // }

      console.log('Publishing to npm')
      await Promise.all(
        packagesToPublish.map(
          (workspace) =>
            $`yarn workspace ${workspace} npm publish --access public --tag ${npmTag}`,
        ),
      )
    }

    void release()

    async function writeVersionsToPackageJSONs(monorepoVersion: string) {
      for (const packagePathRelativeFromRoot of packagesWhoseVersionsShouldBump) {
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
        await $`prettier --write ${
          packagePathRelativeFromRoot + '/package.json'
        }`
      }
    }

    async function restoreVersions() {
      const wasVerbose = $.verbose
      $.verbose = false
      for (const packagePathRelativeFromRoot of packagesWhoseVersionsShouldBump) {
        const pathToPackageInGit = packagePathRelativeFromRoot + '/package.json'

        await $`git checkout ${pathToPackageInGit}`
      }
      $.verbose = wasVerbose
    }
  })

prog
  .command(
    'prerelease ci',
    "This script publishes the insider packages from the CI. You can't run it locally unless you have a a valid npm access token and you store its value in the `NPM_TOKEN` environmental variable.",
  )
  .action(async () => {
    const packagesToPublish = [
      '@theatre/core',
      '@theatre/studio',
      '@theatre/dataverse',
      '@theatre/saaz',
      '@theatre/react',
      '@theatre/browser-bundles',
      '@theatre/r3f',
      'theatric',
    ]

    /**
     * Receives a version number and returns it without the tags, if there are any
     *
     * @param version - Version number
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
    function stripTag(version: string) {
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
     * @param packageName - Name of the package
     * @param commitHash - A commit hash
     */
    function getNewVersionName(packageName: string, commitHash: string) {
      // The `r3f` package has its own release schedule, so its version numbers
      // are almost always different from the rest of the packages.
      const pathToPackageJson =
        packageName === '@theatre/r3f'
          ? path.resolve(__dirname, '../', 'packages', 'r3f', 'package.json')
          : path.resolve(__dirname, '../', './package.json')

      const jsonData = JSON.parse(
        fs.readFileSync(pathToPackageJson, {encoding: 'utf-8'}),
      )
      const strippedVersion = stripTag(jsonData.version)

      return `${strippedVersion}-insiders.${commitHash}`
    }

    /**
     * Assigns the latest version names ({@link getNewVersionName}) to the packages' `package.json`s
     *
     * @param workspacesListObjects - An Array of objects containing information about the workspaces
     * @param latestCommitHash - Hash of the latest commit
     * @returns - A record of `{[packageId]: assignedVersion}`
     */
    async function writeVersionsToPackageJSONs(
      workspacesListObjects: {name: string; location: string}[],
      latestCommitHash: string,
    ): Promise<Record<string, string>> {
      const assignedVersionByPackageName: Record<string, string> = {}
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

        let {version, dependencies, peerDependencies, devDependencies} =
          original
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

    async function prerelease() {
      // @ts-ignore ignore
      process.env.THEATRE_IS_PUBLISHING = true
      // In the CI `git log -1` points to a fake merge commit,
      // so we have to use the value of a special GitHub context variable
      // through the `GITHUB_SHA` environmental variable.

      // The length of the abbreviated commit hash can change, that's why we
      // need the length of the fake merge commit's abbreviated hash.
      const fakeMergeCommitHashLength = (await $`git log -1 --pretty=format:%h`)
        .stdout.length

      if (!process.env.GITHUB_SHA)
        throw new Error(
          'expected `process.env.GITHUB_SHA` to be defined but it was not',
        )

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

      const assignedVersionByPackageName = await writeVersionsToPackageJSONs(
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

      if (process.env.GITHUB_ACTIONS) {
        const data = packagesToPublish.map((packageName) => ({
          packageName,
          version: assignedVersionByPackageName[packageName],
        }))

        // set the output for github actions.
        core.setOutput('data', JSON.stringify(data))
      } else {
        for (const packageName of packagesToPublish) {
          await $`echo ${`Published ${packageName}@${assignedVersionByPackageName[packageName]}`}`
        }
      }
    }

    void prerelease()
  })

{
  const allDevCommands = [
    `yarn workspace playground run serve`,
    `yarn workspace @theatre/app run cli dev all`,
    `yarn workspace @theatre/sync-server run cli dev all`,
  ]

  prog
    .command('dev all', 'Starts all services to develop all of the packages')
    .action(async () => {
      await Promise.all(allDevCommands.map((cmd) => $`${cmd}`))
    })

  prog
    .command(
      'tmux <name>',
      'A helper command to start all the development services in a tmux session',
    )
    .option('--kill', 'If a session by that name already exists, kill it first')
    .action(async (session = 'theatre', opts: {kill?: boolean}) => {
      // check if the session already exists
      if (opts.kill) {
        try {
          await $`tmux kill-session -t ${session}`
        } catch {}
        console.log('starting a new tmux session')
      } else {
        console.log(
          'starting a new tmux session or attaching to an existing one',
        )
      }
      await $`tmux new-session -d -A -s ${session}`

      for (const cmd of allDevCommands) {
        await $`tmux send-keys -t ${session} ${cmd} C-m`
        await $`tmux split-window -t ${session}`
      }

      console.log('to attach to the session, run:')
      console.log(`tmux attach -t ${session}`)

      console.log(
        'to attach to the session in control mode (so for example you can control tmux via iTerm), run:',
      )
      console.log(`tmux -CC attach -t ${session}`)

      await question('Press enter to kill the session')
      await $`tmux kill-session -t ${session}`
    })
}

prog
  .command(`depcheck`, `Check for unused or unlisted dependencies`)
  .action(async () => {
    /**
     * A handy utility to check for unused or unlisted dependencies.
     * We could also include this in the CI checks, but the current config reports some false positives. Once that's fixed, we can add it to the CI (low priority).
     */
    await $`yarn knip --config ./knip.config.json --include unlisted,dependencies --no-exit-code`
  })

prog.parse(process.argv)
