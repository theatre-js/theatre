/**
 * Build the test setups
 */

import path from 'path'
import {colorize, getCompatibilityTestSetups} from './utils.mjs'

const root = path.resolve(__dirname, '../..')
const absPathOfCompatibilityTestSetups = getCompatibilityTestSetups(root)

const setupsWithErros = []

// Try building the setups
;(async function () {
  for (const setupDir of absPathOfCompatibilityTestSetups) {
    try {
      cd(setupDir)
      const pathToSetup = path.join(absPathOfCompatibilityTestSetups, setupDir)
      fs.removeSync(path.join(pathToSetup, 'node_modules'))
      fs.removeSync(path.join(pathToSetup, 'package-lock.json'))
      fs.removeSync(path.join(pathToSetup, 'yarn.lock'))
      await $`npm install`
      await $`npm run build`
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
