/**
 * Utility functions for the ecosystem tests
 */

import fs from 'fs'
import path from 'path'

/**
 * Colorize a message
 */
export const colorize = {
  /** @param {string} message */
  red: (message) => '\x1b[31m' + message + '\x1b[0m',
  /** @param {string} message */
  green: (message) => '\x1b[32m' + message + '\x1b[0m',
  /** @param {string} message */
  yellow: (message) => '\x1b[33m' + message + '\x1b[0m',
}

/**
 * Get all the setups from `./ecosystem-tests/`
 *
 * @param {string} root - Absolute path to the theatre monorepo
 * @returns An array containing the absolute paths to the ecosystem test setups
 */
export function getEcosystemTestSetups(root) {
  const buildTestsDir = path.join(root, 'ecosystem-tests')
  let buildTestsDirEntries

  try {
    buildTestsDirEntries = fs.readdirSync(buildTestsDir)
  } catch {
    throw new Error(
      `Could not list directory: "${buildTestsDir}" Is it an existing directory?`,
    )
  }
  const setupsAbsPaths = []

  // NOTE: We assume that every directory in `ecosystem-tests` is
  // an ecosystem test setup!
  for (const entry of buildTestsDirEntries) {
    const entryAbsPath = path.join(buildTestsDir, entry)
    if (fs.lstatSync(entryAbsPath).isDirectory()) {
      setupsAbsPaths.push(entryAbsPath)
    }
  }

  return setupsAbsPaths
}
