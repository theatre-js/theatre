/**
 * Link the theatre packages
 */

import path from 'path'
import {colorize, getTestBuildProjects} from './utils.mjs'

const root = path.normalize(path.join(__dirname, '..', '..'))
const buildTestProjectAbsPaths = getTestBuildProjects(root)

// The packages that should be linked with `yalc`
const packagesToLink = ['@theatre/core', '@theatre/studio']

/**
 * Add the specified package to the project's dependencies
 * with `yalc link`.
 *
 * @param pkgToLink - The package to link
 */
async function linkPackage(pkgToLink) {
  await $`npx yalc link ${pkgToLink}`
}

const projectsWithErrors = []

// Add the @theatre packages to the build test project
// with `yalc link`
for (const project of buildTestProjectAbsPaths) {
  try {
    cd(project)
    for (let pkg of packagesToLink) {
      linkPackage(pkg)
    }
  } catch {
    projectsWithErrors.push(project)
  }
}

// Stop if there were any errors during the linking process,
// and print all of them to the console.
if (projectsWithErrors.length !== 0) {
  throw new Error(
    `The following projects had problems when their dependencies were being linked:\n${colorize.red(
      projectsWithErrors.join('\n'),
    )}`,
  )
}
