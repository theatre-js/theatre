/**
 * Add the theatre packages to the ecosystem test setups with `yalc link`
 */

import path from 'path'
import {colorize, getEcosystemTestSetups} from './utils.mjs'

const root = path.resolve(__dirname, '../..')
const absPathsOfSetups = getEcosystemTestSetups(root)

// The packages that should be linked with `yalc`
const packagesToLink = [
  '@theatre/core',
  '@theatre/studio',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/r3f',
]

const setupsWithErrors = []

;(async function () {
  for (const setupDir of absPathsOfSetups) {
    try {
      cd(setupDir)
      for (let pkg of packagesToLink) {
        // Add the specified package to the setup's dependencies
        // with `yalc link`.
        await $`npx yalc link ${pkg}`
      }
    } catch (err) {
      console.error(err)
      setupsWithErrors.push(setupDir)
    }
  }

  // Stop if there were any errors during the linking process,
  // and print all of them to the console.
  if (setupsWithErrors.length !== 0) {
    throw new Error(
      `The following setups had problems when their dependencies were being linked:\n${colorize.red(
        setupsWithErrors.join('\n'),
      )}`,
    )
  }
})()
