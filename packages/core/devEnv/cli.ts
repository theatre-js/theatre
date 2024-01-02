import sade from 'sade'
import {path, $} from '@cspotcode/zx'
import * as esbuild from 'esbuild'
import {definedGlobals} from './definedGlobals'
const packageRoot = path.join(__dirname, '..')

const prog = sade('cli')

prog
  .command('build js', 'Generate the .js bundle')
  .option('--watch', 'Watch')
  .action(async (opts) => {
    await bundle(opts.watch)
  })

prog.command('build ts', 'Generate the .d.ts bundle').action(async () => {
  await bundleTypes()
})

prog.command('build', 'Generate the .js and .d.ts bundles').action(async () => {
  await Promise.all([bundle(false), bundleTypes()])
})

prog.parse(process.argv)

async function bundleTypes() {
  await $`tsc --build`
  await $`rollup -c devEnv/declarations-bundler/rollup.config.js --bundleConfigAsCjs`
}

async function bundle(watch: boolean) {
  const esbuildConfig: Parameters<typeof esbuild.context>[0] = {
    entryPoints: [path.join(packageRoot, 'src/index.ts')],
    target: ['es6'],
    // loader: {'.png': 'file', '.svg': 'dataurl'},
    bundle: true,
    sourcemap: true,
    supported: {
      // 'unicode-escapes': false,
      'template-literal': false,
    },
    define: {
      ...definedGlobals,
      __IS_VISUAL_REGRESSION_TESTING: 'false',
      'process.env.NODE_ENV': '"production"',
    },
    external: ['@theatre/dataverse'],
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: false,
    treeShaking: true,
  }

  esbuildConfig.platform = 'neutral'
  esbuildConfig.mainFields = ['browser', 'module', 'main']
  esbuildConfig.target = ['firefox57', 'chrome58']
  esbuildConfig.conditions = ['browser', 'node']

  const ctx = await esbuild.context({
    ...esbuildConfig,
    outfile: path.join(packageRoot, 'dist/index.js'),
    format: 'cjs',
  })

  if (watch) {
    await ctx.watch()
  } else {
    await ctx.rebuild()
    await ctx.dispose()
  }
}
