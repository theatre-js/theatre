;(async function () {
  // better quote function from https://github.com/google/zx/pull/167
  $.quote = function quote(arg) {
    return arg
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

  const watch = argv.watch === true

  await Promise.all(
    ['core', 'studio'].map(
      (which) =>
        $`typedoc ${
          watch ? '--watch ' : ''
        } --out docs/api/${which} --name "@theatre/${which}" --tsconfig theatre/tsconfig.json --excludeInternal --sort source-order --readme none --hideBreadcrumbs true --categorizeByGroup false --defaultCategory "Main APIs" --hideInPageTOC true theatre/${which}/src/index.ts`,
    ),
  )
})()
