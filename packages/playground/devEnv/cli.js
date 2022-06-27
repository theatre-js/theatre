const {timer} = require('./timer')

const dev = process.argv.find((arg) => ['--dev', '-d'].includes(arg)) != null
const isCI = Boolean(process.env.CI)
let current

function onUpdatedBuildScript(rebuild) {
  delete require.cache[require.resolve('./build.compiled')]
  /** @type {import("./build")} */
  const module = require('./build.compiled')
  const _start = timer('build.compiled start')
  try {
    module
      .start({
        dev,
        findAvailablePort: !isCI,
        // If not in CI, try to spawn a browser
        openBrowser: !isCI && !rebuild,
        waitBeforeStartingServer: current?.stop(),
      })
      .then((running) => {
        current = running
      })
      .catch((err) => {
        console.error('cli.js calling start() in build.compiled.js', err)
      })
      .finally(() => _start.stop())
  } catch (err) {
    _start.stop()
  }
}

timer('cli.js').wrap(() => {
  timer('esbuild build.compiled.js').wrap(() => {
    const {build} = require('esbuild')

    // compile build files directly which is about 10x faster than esbuild-register
    build({
      entryPoints: [__dirname + '/build.ts'],
      outfile: __dirname + '/build.compiled.js',
      bundle: true,
      platform: 'node',
      external: ['esbuild', 'react', 'react-dom/server'],
      watch: dev && {
        onRebuild(err, res) {
          if (!err) {
            onUpdatedBuildScript(true)
          }
        },
      },
    }).then(() => {
      onUpdatedBuildScript(false)
    })
  })
})
