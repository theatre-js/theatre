/**
 * The build-test script. This must be called with zx from the repo's root. Created
 * Example:
 * ```
 * $ cd /path/to/repo
 * $ yarn run build-tests 0.4.2
 * ```
 *
 * Note that this script was created mainly for the CI.
 */

/**
 * Colorize a message.
*/
const colorize = {
  red: message =>  '\x1b[31m' + message + '\x1b[0m',
  green: message => '\x1b[32m' + message + '\x1b[0m',
  yellow: message => '\x1b[33m' + message + '\x1b[0m'
}

import fs from 'fs'
import path from 'path'
// Find the root of the theatre monorepo
const root = path.normalize(path.join(__dirname, '..'))

// The packages that should be linked with `yalc`
const packagesToLink = ["@theatre/core", "@theatre/studio"]

// Get all the projects from `./build_tests/`
const build_tests_directory = path.join(root, 'build_tests')
let build_tests_directory_entries
let build_tests

try {
  build_tests_directory_entries = fs.readdirSync(build_tests_directory)
  build_tests = fs.opendirSync(build_tests_directory)
} catch {
  throw new Error(
    `Could not list directory: "${build_tests_directory}" Is it an existing directory?`,
  )
}
const project_list = []

// Every directory in `build_tests` is supposed to be
// a build test project
for (let i = 0; i < build_tests_directory_entries.length; i++) {
  const dirent = build_tests.readSync()
  if (dirent.isDirectory()) {
    project_list.push(path.join(build_tests_directory, dirent.name))
  }
}

/*
Install the dependencies of the projects and
Link the dependencies with yalc
*/
const linking_errors = []
for (const project of project_list) {
  try {
    cd(project)
    for (let pkg of packagesToLink) {
      await $`npx yalc link ${pkg}`
    }
  } catch {
    // linking_errors.push(err)
    linking_errors.push(project)
  }
}

/*
Stop if there were any errors during the linking process,
and print all of them to the console.
*/
if (linking_errors.length !== 0) {
  console.error("@theatre packages could not be linked for some of the projects. See the errors below!")
  throw new Error(`The following projects had problems with in the linking stage:\n${colorize.red(linking_errors.join('\n'))}`)
}


/*
Build the projects one-by-one.
Save the name of the projects that could not built.
*/
const buildErrors = []
for (const project of project_list) {
  try {
    // TODO: build every project
    cd(project)
    await $`yarn build`
  } catch {
    buildErrors.push(project)
  }
}

/*
Stop if there were any errors during the build process,
and print all of them to the console.
*/
if (buildErrors.length !== 0) {
  throw new Error(`The following projects could not be built:\n${colorize.red(buildErrors.join("\n"))}`)
}

console.log(colorize.green(`All the projects in "${build_tests_directory}" have been successfully built.`))
