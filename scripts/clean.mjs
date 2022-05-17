/**
 * cleans the build artifacts of all packages
 */

const packages = [
  'theatre',
  '@theatre/dataverse',
  '@theatre/react',
  '@theatre/browser-bundles',
  '@theatre/r3f',
]

;(async function () {
  // better quote function from https://github.com/google/zx/pull/167
  $.quote = function quote(arg) {
    if (/^[a-z0-9/_.-]+$/i.test(arg)) {
      return arg
    }
    return (
      `$'` +
      arg
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\f/g, '\\f')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
        .replace(/\v/g, '\\v')
        .replace(/\0/g, '\\0') +
      `'`
    )
  }

  await Promise.all([
    ...packages.map((workspace) => $`yarn workspace ${workspace} run clean`),
  ])
})()
