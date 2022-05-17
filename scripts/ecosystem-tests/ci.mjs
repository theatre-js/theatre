;(async function () {
  await $`zx scripts/publish-to-yalc.mjs`
  await $`zx scripts/ecosystem-tests/install-dependencies.mjs`
  await $`zx scripts/ecosystem-tests/link-theatre-packages.mjs`
  await $`zx scripts/ecosystem-tests/build-setups.mjs`
})()
