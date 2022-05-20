/**
 * Utility functions for the compatibility tests
 */

import fs from 'fs'
import path from 'path'

export const VERDACCIO_PORT = 4823
export const VERDACCIO_HOST = `localhost`
export const VERDACCIO_URL = `http://${VERDACCIO_HOST}:${VERDACCIO_PORT}/`
export const MONOREPO_ROOT = path.join(__dirname, '../..')
export const PATH_TO_YARNRC = path.join(MONOREPO_ROOT, '.yarnrc.yml')

/**
 * Get all the setups from `./compatibility-tests/`
 *
 * @returns {Array<string>} An array containing the absolute paths to the compatibility test setups
 */
export function getCompatibilityTestSetups() {
  const buildTestsDir = path.join(MONOREPO_ROOT, 'compatibility-tests')
  let buildTestsDirEntries

  try {
    buildTestsDirEntries = fs.readdirSync(buildTestsDir)
  } catch {
    throw new Error(
      `Could not list directory: "${buildTestsDir}" Is it an existing directory?`,
    )
  }
  const setupsAbsPaths = []

  // NOTE: We assume that every directory matching `compatibility-tests/test-*` is
  // a test package
  for (const entry of buildTestsDirEntries) {
    if (!entry.startsWith('test-')) continue
    const entryAbsPath = path.join(buildTestsDir, entry)
    if (fs.lstatSync(entryAbsPath).isDirectory()) {
      setupsAbsPaths.push(entryAbsPath)
    }
  }

  return setupsAbsPaths
}
