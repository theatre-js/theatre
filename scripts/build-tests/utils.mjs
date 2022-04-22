/**
 * Utility functions for the build tests
 */

import fs from 'fs'
import path from 'path'
// Find the root of the theatre monorepo

/**
 * Find the root directory of the theatre monorepo
 *
 * @returns The root of the theatre monorepo
 */
function findRootDirectory() {
  const root = path.normalize(path.join(__dirname, '..', '..'))
  return root
}

export const root = findRootDirectory()

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
function getTestBuildProjects(root) {
  const buildTestsDir = path.join(root, 'build_tests')
  let buildTestsDirEntries
  let buildTests

  try {
    buildTestsDirEntries = fs.readdirSync(buildTestsDir)
    buildTests = fs.opendirSync(buildTestsDir)
  } catch {
    throw new Error(
      `Could not list directory: "${buildTestsDir}" Is it an existing directory?`,
    )
  }
  const projectAbsPaths = []

  // NOTE: We assume that every directory in `build_tests` is
  // a build test project!
  for (let i = 0; i < buildTestsDirEntries.length; i++) {
    const dirent = buildTests.readSync()
    if (dirent.isDirectory()) {
      projectAbsPaths.push(path.join(buildTestsDir, dirent.name))
    }
  }

  return projectAbsPaths
}

/**
 * The absolute paths of the build test projects in an array
 */
export const buildTestProjectAbsPaths = getTestBuildProjects(root)
