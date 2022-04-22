/**
 * Install the dependencies of the build test projects
 */

import {buildTestProjectAbsPaths, colorize} from './utils.mjs'

const projectsWithErrors = []

// Try installing the dependencies of the build projects
for (const project of buildTestProjectAbsPaths) {
  try {
    cd(project)
    ;(async function () {
      await $`yarn`
    })()
  } catch {
    projectsWithErrors.push(project)
  }
}

/*
Stop if there were any errors during the linking process,
and print all of them to the console.
*/
if (projectsWithErrors.length !== 0) {
  throw new Error(
    `The following projects had problems when their dependencies were being installed:\n${colorize.red(
      projectsWithErrors.join('\n'),
    )}`,
  )
}