/**
 * Publish the theatre packages to a local registry with yalc for the build tests.
 */

import { root } from './build-tests/utils.mjs'

// Make sure the script runs in the root of the monorepo
cd(root)


// Build the packages before publishing them
;(async function() {await $`yarn build`})()

const packagesToPublish = ['theatre/core', 'theatre/studio']

process.env.USING_YALC = 'true'

/**
 * Publish a packages to the local `yalc` registry
 * 
 * @param pkg - The package that should be published
 */
async function publishPkg(pkg) {
  await $`npx yalc publish ${pkg}`
}

// Publish the packages to the local `yalc` registry
for (const pkg of packagesToPublish) {
  publishPkg(pkg)
}