import {readdirSync} from 'fs'
import {writeFile, readFile} from 'fs/promises'
import path from 'path'
import type {BuildOptions} from 'esbuild'
import esbuild from 'esbuild'
import {definedGlobals} from '../../../theatre/devEnv/definedGlobals'
import {mapValues} from 'lodash-es'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {ServerStyleSheet} from 'styled-components'
import {PlaygroundPage} from './home/PlaygroundPage'
import {timer} from './timer'
import {openForOS} from './openForOS'
import {tryMultiplePorts} from './tryMultiplePorts'
import {createProxyServer} from './createProxyServer'
import {createEsbuildLiveReloadTools} from './createEsbuildLiveReloadTools'
import {createServerForceClose} from './createServerForceClose'

const playgroundDir = (folder: string) => path.join(__dirname, '..', folder)
const buildDir = playgroundDir('build')
const sharedDir = playgroundDir('src/shared')
const personalDir = playgroundDir('src/personal')
const testDir = playgroundDir('src/tests')

export async function start(options: {
  dev: boolean
  findAvailablePort: boolean
  openBrowser: boolean
  waitBeforeStartingServer?: Promise<void>
  /** defaults to 8080 */
  defaultPort?: number
}): Promise<{stop(): Promise<void>}> {
  const defaultPort = options.defaultPort ?? 8080

  const liveReload = options.dev ? createEsbuildLiveReloadTools() : undefined

  type Groups = {
    [group: string]: {
      [module: string]: {
        entryDir: string
        outDir: string
      }
    }
  }

  // Collect all entry directories per module per group
  const groups: Groups = Object.fromEntries(
    [sharedDir, personalDir, testDir]
      .map((groupDir) => {
        try {
          return [
            path.basename(groupDir),
            Object.fromEntries(
              readdirSync(groupDir).map((moduleDirName) => [
                path.basename(moduleDirName),
                {
                  entryDir: path.join(groupDir, moduleDirName),
                  outDir: path.join(
                    buildDir,
                    path.basename(groupDir),
                    moduleDirName,
                  ),
                },
              ]),
            ),
          ]
        } catch (e) {
          // If the group dir doesn't exist, we just set its entry to undefined
          return [path.basename(groupDir), undefined]
        }
      })
      // and then filter it out.
      .filter((entry) => entry[1] !== undefined),
  )

  // Collect all entry files
  const entryPoints = Object.values(groups)
    .flatMap((group) => Object.values(group))
    .map((module) => path.join(module.entryDir, 'index.tsx'))

  // Collect all output directories
  const outDirs = Object.values(groups).flatMap((group) =>
    Object.values(group).map((module) => module.outDir),
  )

  // Render home page contents

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

  const _initialBuild = timer('esbuild initial playground entry point builds')

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
      '.svg': 'dataurl',
    },
    define: {
      ...definedGlobals,
      'window.__IS_VISUAL_REGRESSION_TESTING': 'true',
    },
    banner: liveReload?.esbuildBanner,
    watch: liveReload?.esbuildWatch && {
      onRebuild(error, result) {
        esbuildWatchStop = result?.stop ?? esbuildWatchStop
        liveReload?.esbuildWatch.onRebuild?.(error, result)
      },
    },
  }

  let esbuildWatchStop: undefined | (() => void)

  await esbuild
    .build(esbuildConfig)
    .finally(() => _initialBuild.stop())
    .catch((err) => {
      // if in dev mode, permit continuing to watch even if there was an error
      return options.dev ? Promise.resolve() : Promise.reject(err)
    })
    .then(async (buildResult) => {
      esbuildWatchStop = buildResult?.stop
      // Read index.html template
      const index = await readFile(path.join(__dirname, 'index.html'), 'utf8')
      await Promise.all([
        // Write home page
        writeFile(
          path.join(buildDir, 'index.html'),
          index
            .replace(/<\/head>/, `${homeHtml.head}<\/head>`)
            .replace(/<body>/, `<body>${homeHtml.html}`),
          'utf-8',
        ),
        // Write module pages
        ...outDirs.map((outDir) =>
          writeFile(
            path.join(outDir, 'index.html'),
            // Insert the script
            index.replace(
              /<\/body>/,
              `<script src="${path.join(
                '/',
                path.relative(buildDir, outDir),
                'index.js',
              )}"></script></body>`,
            ),
            'utf-8',
          ),
        ),
      ])
    })
    .catch((err) => {
      console.error(err)
      return process.exit(1)
    })

  // Only start dev server in dev, otherwise just run build and that's it
  if (!options.dev) {
    return {
      stop() {
        esbuildWatchStop?.()
        return Promise.resolve()
      },
    }
  }

  await options.waitBeforeStartingServer

  // We start ESBuild serve with no build config because it doesn't need to build
  // anything, we are already using ESBuild watch.
  /** See https://esbuild.github.io/api/#serve-return-values */
  const esbuildServe = await esbuild.serve({servedir: buildDir}, {})

  const proxyServer = createProxyServer(liveReload?.handleRequest, {
    hostname: '0.0.0.0',
    port: esbuildServe.port,
  })

  const proxyForceExit = createServerForceClose(proxyServer)
  const portTries = options.findAvailablePort ? 10 : 1
  const portChosen = await tryMultiplePorts(defaultPort, portTries, proxyServer)

  const hostedAt = `http://localhost:${portChosen}`

  console.log('Playground running at', hostedAt)

  if (options.openBrowser) {
    setTimeout(() => {
      if (!liveReload?.hasOpenConnections()) openForOS(hostedAt)
    }, 1000)
  }

  return {
    stop() {
      esbuildServe.stop()
      esbuildWatchStop?.()
      return Promise.all([proxyForceExit(), esbuildServe.wait]).then(() => {
        // map to void for type defs
      })
    },
  }
}
