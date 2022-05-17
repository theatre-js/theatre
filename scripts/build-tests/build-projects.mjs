/**
 * Build the test projects
 */

import path from 'path'
import {colorize, getTestBuildProjects} from './utils.mjs'

const root = path.resolve(__dirname, '../..')
const buildTestProjectAbsPaths = getTestBuildProjects(root)

const setupsWithErros = []

// Try building the test projects
;(async function () {
  for (const project of buildTestProjectAbsPaths) {
    try {
      cd(project)
      await $`yarn build`
    } catch (err) {
      console.error(err)
      setupsWithErros.push(project)
    }
  }

  // Stop if there were any errors during the build process,
  // and print all of them to the console.
  if (setupsWithErros.length !== 0) {
    throw new Error(
      `The following projects had problems when their dependencies were being installed:\n${colorize.red(
        setupsWithErros.join('\n'),
      )}`,
    )
  }
})()
