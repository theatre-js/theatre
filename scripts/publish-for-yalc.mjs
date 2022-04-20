/**
 * Publish the @theatre packages to a local registry with yalc for the build tests.
 */

import fs from 'fs'
import path from 'path'

// Find the root of the theatre monorepo
const root = path.normalize(path.join(__dirname, '..'))
// Make sure the script runs in the root of the monorepo
cd(root)


/*
 * Build the packages before publishing them
 */
await $`yarn build`

const packagesToPublish = ["theatre/core", "theatre/studio"]

/*
 * Publish the packages
 */
process.env.USING_YALC = "true"

for (const pkg of packagesToPublish) {
  await $`npx yalc publish ${pkg}`
}

/*
 * NOTE: the `yalc` publish process will not exit with an error
 * code if the package cannot be published (i.e. it's missing),
 * even though it will log the message. For this reason we don't
 * print a "success" message here.
 */
