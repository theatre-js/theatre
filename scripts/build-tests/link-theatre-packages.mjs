/**
 * Add the theatre packages to the build test projects with `yalc link`
 */

import path from 'path'
import {colorize, getTestBuildProjects} from './utils.mjs'

const root = path.normalize(path.join(__dirname, '..', '..'))
const buildTestProjectAbsPaths = getTestBuildProjects(root)

// The packages that should be linked with `yalc`
const packagesToLink = ['@theatre/core', '@theatre/studio']

const projectsWithErrors = []

;(async function () {
  for (const project of buildTestProjectAbsPaths) {
    try {
      cd(project)
      for (let pkg of packagesToLink) {
        // Add the specified package to the project's dependencies
        // with `yalc link`.
        await $`npx yalc link ${pkg}`
      }
    } catch (err) {
      console.error(err)
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
})()
