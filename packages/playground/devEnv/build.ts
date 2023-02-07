import type {BuildOptions} from 'esbuild'
import esbuild from 'esbuild'
import {readdir, readFile, stat, writeFile} from 'fs/promises'
import {mapValues} from 'lodash-es'
import path from 'path'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {ServerStyleSheet} from 'styled-components'
import {definedGlobals} from '../../../theatre/devEnv/definedGlobals'
import {createEsbuildLiveReloadTools} from './createEsbuildLiveReloadTools'
import {createProxyServer} from './createProxyServer'
import {PlaygroundPage} from './home/PlaygroundPage'
import {openForOS} from './openForOS'
import {tryMultiplePorts} from './tryMultiplePorts'

const playgroundDir = (folder: string) => path.join(__dirname, '..', folder)
const buildDir = playgroundDir('build')
const srcDir = playgroundDir('src')
const sharedDir = playgroundDir('src/shared')
const personalDir = playgroundDir('src/personal')
const testDir = playgroundDir('src/tests')

async function start(options: {
  /** enable live reload and watching stuff */
  dev: boolean
  /** make some UI elements predictable by setting the __IS_VISUAL_REGRESSION_TESTING value on window */
  isVisualRegressionTesting: boolean
  serve?: {
    findAvailablePort: boolean
    openBrowser: boolean
    /** defaults to 8080 */
    defaultPort?: number
  }
}): Promise<void> {
  const defaultPort = options.serve?.defaultPort ?? 8080

  const liveReload =
    options.serve && options.dev ? createEsbuildLiveReloadTools() : undefined

  type PlaygroundExample = {
    useHtml?: string
    entryFilePath: string
    outDir: string
  }

  type Groups = {
    [group: string]: {
      [module: string]: PlaygroundExample
    }
  }

  // Collect all entry directories per module per group
  const groups: Groups = await Promise.all(
    [sharedDir, personalDir, testDir].map(async (groupDir) => {
      let groupDirItems: string[]

      try {
        groupDirItems = await readdir(groupDir)
      } catch (error) {
        // If the group dir doesn't exist, we just set its entry to undefined
        return [path.basename(groupDir), undefined]
      }

      const allEntries = await Promise.all(
        groupDirItems.map(
          async (
            moduleDirName,
          ): Promise<[string, PlaygroundExample | undefined]> => {
            const playgroundKey = path.basename(moduleDirName)
            const entryFilePath = path.join(
              groupDir,
              moduleDirName,
              'index.tsx',
            )

            if (
              !(await stat(entryFilePath)
                .then((s) => s.isFile())
                .catch(() => false))
            )
              return [playgroundKey, undefined]

            const playgroundExample = {
              useHtml: await readFile(
                path.join(groupDir, moduleDirName, 'index.html'),
                'utf-8',
              ).catch(() => undefined),
              entryFilePath,
              outDir: path.join(
                buildDir,
                path.basename(groupDir),
                moduleDirName,
              ),
            }

            return [playgroundKey, playgroundExample]
          },
        ),
      )

      const validEntries = allEntries.filter(
        ([_, playgroundExample]) => playgroundExample !== undefined,
      )

      return [path.basename(groupDir), Object.fromEntries(validEntries)]
    }),
  ).then((entries) =>
    Object.fromEntries(
      // and then filter it out.
      entries.filter((entry) => entry[1] !== undefined),
    ),
  )

  // Collect all entry files
  const entryPoints = Object.values(groups)
    .flatMap((group) => Object.values(group))
    .map((module) => module.entryFilePath)

  // Collect all output directories
  const outModules: PlaygroundExample[] = Object.values(groups).flatMap(
    (group) => Object.values(group),
  )

  // Render home page contents
  const homeHtml = (() => {
    const sheet = new ServerStyleSheet()
    try {
      const html = renderToStaticMarkup(
        sheet.collectStyles(
          React.createElement(PlaygroundPage, {
            groups: mapValues(groups, (group) => Object.keys(group)),
          }),
        ),
      )
      const styleTags = sheet.getStyleTags() // or sheet.getStyleElement();
      sheet.seal()
      return {
        head: styleTags,
        html,
      }
    } catch (error) {
      // handle error
      console.error(error)
      sheet.seal()
      process.exit(1)
    }
  })()

  const esbuildConfig: BuildOptions = {
    entryPoints,
    bundle: true,
    sourcemap: true,
    outdir: buildDir,
    target: ['firefox88'],
    loader: {
      '.png': 'file',
      '.glb': 'file',
      '.gltf': 'file',
      '.mp3': 'file',
      '.ogg': 'file',
      '.svg': 'dataurl',
    },
    define: {
      ...definedGlobals,
      'window.__IS_VISUAL_REGRESSION_TESTING': JSON.stringify(
        options.isVisualRegressionTesting,
      ),
      'process.env.BUILT_FOR_PLAYGROUND': JSON.stringify('true'),
    },
    banner: liveReload?.esbuildBanner,
    // watch: liveReload?.esbuildWatch && {
    //   onRebuild(error, result) {
    //     esbuildWatchStop = result?.stop ?? esbuildWatchStop
    //     liveReload?.esbuildWatch.onRebuild?.(error, result)
    //   },
    // },
    plugins: [
      {
        name: 'watch playground assets',
        setup(build) {
          build.onStart(() => {})
          build.onLoad(
            {
              filter: /index\.tsx?$/,
            },
            async (loadFile) => {
              const indexHtmlPath = loadFile.path.replace(
                /index\.tsx?$/,
                'index.html',
              )
              const relToSrc = path.relative(srcDir, indexHtmlPath)
              const isInSrcFolder = !relToSrc.startsWith('..')
              if (isInSrcFolder) {
                const newHtml = await readFile(indexHtmlPath, 'utf-8').catch(
                  () => undefined,
                )
                if (newHtml) {
                  await writeFile(
                    path.resolve(buildDir, relToSrc),
                    newHtml.replace(
                      /<\/body>/,
                      `<script src="${path.join(
                        '/',
                        relToSrc,
                        '../index.js',
                      )}"></script></body>`,
                    ),
                  ).catch(
                    wrapCatch(
                      `loading index.tsx creates corresponding index.html for ${relToSrc}`,
                    ),
                  )
                }

                return {
                  watchFiles: [indexHtmlPath],
                }
              }
            },
          )
        },
      },
    ],
  }

  const ctx = await esbuild.context(esbuildConfig)

  if (liveReload) {
    await ctx.watch()
  } else {
    // await ctx.rebuild()
  }

  // Read index.html template
  const index = await readFile(
    path.join(__dirname, 'index.html'),
    'utf8',
  ).catch(wrapCatch('reading index.html template'))
  await Promise.all([
    // Write home page
    writeFile(
      path.join(buildDir, 'index.html'),
      index
        .replace(/<\/head>/, `${homeHtml.head}<\/head>`)
        .replace(/<body>/, `<body>${homeHtml.html}`),
      'utf-8',
    ).catch(wrapCatch('writing build index.html')),
    // Write module pages
    ...outModules.map((outModule) =>
      writeFile(
        path.join(outModule.outDir, 'index.html'),
        // Insert the script
        (outModule.useHtml ?? index).replace(
          /<\/body>/,
          `<script src="${path.join(
            '/',
            path.relative(buildDir, outModule.outDir),
            'index.js',
          )}"></script></body>`,
        ),
        'utf-8',
      ).catch(
        wrapCatch(
          `writing index.html for ${path.relative(buildDir, outModule.outDir)}`,
        ),
      ),
    ),
  ])

  // Only start dev server in serve, otherwise just run build and that's it
  if (!options.serve) {
    await ctx.dispose()
    return
  }

  const {serve} = options

  // We start ESBuild serve with no build config because it doesn't need to build
  // anything, we are already using ESBuild watch.
  /** See https://esbuild.github.io/api/#serve-return-values */
  const esbuildServe = await ctx.serve({servedir: buildDir})

  const proxyServer = createProxyServer(liveReload?.handleRequest, {
    hostname: '0.0.0.0',
    port: esbuildServe.port,
  })

  // const proxyForceExit = createServerForceClose(proxyServer)
  const portTries = serve.findAvailablePort ? 10 : 1
  const portChosen = await tryMultiplePorts(defaultPort, portTries, proxyServer)

  const hostedAt = `http://localhost:${portChosen}`

  console.log('Playground running at', hostedAt)

  if (serve.openBrowser) {
    setTimeout(() => {
      if (!liveReload?.hasOpenConnections()) openForOS(hostedAt)
    }, 1000)
  }

  // return {
  //   async stop() {
  //     esbuildWatchStop?.()
  //     await proxyForceExit()
  //   },
  // }
}

function wrapCatch(message: string) {
  return (err: any) => {
    return Promise.reject(`Rejected "${message}":\n    ${err.toString()}`)
  }
}

const dev = process.argv.find((arg) => ['--dev', '-d'].includes(arg)) != null

const serve =
  process.argv.find((arg) => ['--serve'].includes(arg)) != null || undefined

const isCI = Boolean(process.env.CI)

start({
  dev: !isCI && dev,
  isVisualRegressionTesting: isCI,
  serve: serve && {
    findAvailablePort: !isCI,
    // If not in CI, try to spawn a browser
    openBrowser: !isCI,
    // waitBeforeStartingServer: current?.stop(),
  },
})
