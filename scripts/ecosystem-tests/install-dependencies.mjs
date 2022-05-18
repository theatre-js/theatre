/**
 * Install the dependencies of the ecosystem test setups
 */

import path from 'path'
import {colorize, getEcosystemTestSetups} from './utils.mjs'

const root = path.resolve(__dirname, '../..')

const absPathOfTestSetups = getEcosystemTestSetups(root)

const setupsWithErrors = []

// Try installing the dependencies of the test setups
;(async function () {
  for (const dirOfSetup of absPathOfTestSetups) {
    try {
      cd(dirOfSetup)
      await $`yarn`
    } catch (err) {
      console.error(err)
      setupsWithErrors.push(dirOfSetup)
    }
  }

  // Stop if there were any errors during the linking process,
  // and print all of them to the console.
  if (setupsWithErrors.length !== 0) {
    throw new Error(
      `The following setups had problems when their dependencies were being installed:\n${colorize.red(
        setupsWithErrors.join('\n'),
      )}`,
    )
  }
})()
