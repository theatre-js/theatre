/**
 * Utility functions for the build tests
 */

import fs from 'fs'
import path from 'path'

/**
 * Colorize a message
 */
export const colorize = {
  red: (message) => '\x1b[31m' + message + '\x1b[0m',
  green: (message) => '\x1b[32m' + message + '\x1b[0m',
  yellow: (message) => '\x1b[33m' + message + '\x1b[0m',
}

/**
 * Get all the projects from `./build_tests/`
 *
 * @param root - Absolute path to the theatre monorepo
 * @returns An array containing the absolute paths to the build test projects
 */
export function getTestBuildProjects(root) {
  const buildTestsDir = path.join(root, 'build_tests')
  let buildTestsDirEntries

  try {
    buildTestsDirEntries = fs.readdirSync(buildTestsDir)
  } catch {
    throw new Error(
      `Could not list directory: "${buildTestsDir}" Is it an existing directory?`,
    )
  }
  const projectAbsPaths = []

  // NOTE: We assume that every directory in `build_tests` is
  // a build test project!
  for (const entry of buildTestsDirEntries) {
    const entryAbsPath = path.join(buildTestsDir, entry)
    if (fs.lstatSync(entryAbsPath).isDirectory()) {
      projectAbsPaths.push(entryAbsPath)
    }
  }

  return projectAbsPaths
}
