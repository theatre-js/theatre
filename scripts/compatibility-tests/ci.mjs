;(async function () {
  await $`zx scripts/publish-to-yalc.mjs`
  await $`zx scripts/compatibility-tests/install-dependencies.mjs`
  await $`zx scripts/compatibility-tests/link-theatre-packages.mjs`
  await $`zx scripts/compatibility-tests/build-setups.mjs`
})()
