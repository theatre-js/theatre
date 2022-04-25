/**
 * Install the dependencies of the build test projects
 */

import path from 'path'
import {colorize, getTestBuildProjects} from './utils.mjs'

const root = path.resolve(__dirname, '../..')

const buildTestProjectAbsPaths = getTestBuildProjects(root)

const projectsWithErrors = []

// Try installing the dependencies of the build projects
;(async function () {
  for (const project of buildTestProjectAbsPaths) {
    try {
      cd(project)
      await $`yarn`
    } catch (err) {
      console.error(err)
      projectsWithErrors.push(project)
    }
  }

  // Stop if there were any errors during the linking process,
  // and print all of them to the console.
  if (projectsWithErrors.length !== 0) {
    throw new Error(
      `The following projects had problems when their dependencies were being installed:\n${colorize.red(
        projectsWithErrors.join('\n'),
      )}`,
    )
  }
})()
