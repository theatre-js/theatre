/**
 * Build the test setups
 */

import path from 'path'
import {colorize, getEcosystemTestSetups} from './utils.mjs'

const root = path.resolve(__dirname, '../..')
const absPathOfEcosystemTestSetups = getEcosystemTestSetups(root)

const setupsWithErros = []

// Try building the setups
;(async function () {
  for (const setupDir of absPathOfEcosystemTestSetups) {
    try {
      cd(setupDir)
      await $`yarn build`
    } catch (err) {
      console.error(err)
      setupsWithErros.push(setupDir)
    }
  }

  // Stop if there were any errors during the build process,
  // and print all of them to the console.
  if (setupsWithErros.length !== 0) {
    throw new Error(
      `The following setups had problems when their dependencies were being installed:\n${colorize.red(
        setupsWithErros.join('\n'),
      )}`,
    )
  }
})()
