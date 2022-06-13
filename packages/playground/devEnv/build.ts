import {readdirSync} from 'fs'
import {writeFile, readFile} from 'fs/promises'
import path from 'path'
import type {BuildOptions} from 'esbuild'
import esbuild from 'esbuild'
import type {IncomingMessage, ServerResponse} from 'http'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'
import {mapValues} from 'lodash-es'
import {createServer, request} from 'http'
import {spawn} from 'child_process'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {Home} from './Home'
import type {Server} from 'net'

const playgroundDir = (folder: string) => path.join(__dirname, '..', folder)
const buildDir = playgroundDir('build')
const sharedDir = playgroundDir('src/shared')
const personalDir = playgroundDir('src/personal')
const testDir = playgroundDir('src/tests')

const dev = process.argv.find((arg) => ['--dev', '-d'].includes(arg)) != null
const defaultPort = 8080

const liveReload =
  (dev || undefined) &&
  ((): {
    handleRequest(req: IncomingMessage, res: ServerResponse): boolean
    hasOpenConnections(): boolean
    esbuildBanner: esbuild.BuildOptions['banner']
    esbuildWatch: esbuild.WatchMode
  } => {
    const openResponses: ServerResponse[] = []
    return {
      handleRequest(req, res) {
        // If special /esbuild url requested, subscribe clients to changes
        if (req.url === '/esbuild') {
          openResponses.push(
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            }),
          )
          return true
        }
        return false
      },
      hasOpenConnections() {
        return openResponses.length > 0
      },
      esbuildBanner: {
        js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();',
      },
      esbuildWatch: {
        onRebuild(error) {
          // Notify clients on rebuild
          openResponses.forEach((res) => res.write('data: update\n\n'))
          openResponses.length = 0
          console.error(error ? error : 'Reloading...')
        },
      },
    }
  })()

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
const homeHtml = renderToStaticMarkup(
  React.createElement(Home, {
    groups: mapValues(groups, (group) => Object.keys(group)),
  }),
)

const config: BuildOptions = {
  entryPoints,
  bundle: true,
  sourcemap: true,
  outdir: playgroundDir('build'),
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
  watch: liveReload?.esbuildWatch,
}

esbuild
  .build(config)
  .then(async () => {
    // Read index.html template
    const index = await readFile(path.join(__dirname, 'index.html'), 'utf8')
    await Promise.all([
      // Write home page
      writeFile(
        path.join(buildDir, 'index.html'),
        index.replace(/<body>[\s\S]*<\/body>/, `<body>${homeHtml}</body>`),
      ),
      // Write module pages
      ...outDirs.map((outDir) =>
        writeFile(
          path.join(outDir, 'index.html'),
          // Substitute %ENTRYPOINT% placeholder with the output file path
          index.replace(
            '%ENTRYPOINT%',
            path.join('/', path.relative(buildDir, outDir), 'index.js'),
          ),
        ),
      ),
    ])
  })
  .catch((err) => {
    console.log(err)
    return process.exit(1)
  })
  .then(async () => {
    // Only start dev server in dev, otherwise just run build and that's it
    if (!dev) {
      return
    }

    // We start ESBuild serve with no build config because it doesn't need to build
    // anything, we are already using ESBuild watch.
    const {port: esbuildPort} = await esbuild.serve(
      {servedir: playgroundDir('build')},
      {},
    )

    const proxyServer = createServer((req, res) => {
      const {url, method, headers} = req
      if (liveReload?.handleRequest(req, res)) {
        return
      }

      // Otherwise forward requests to ESBuild server
      req.pipe(
        request(
          {
            hostname: '0.0.0.0',
            port: esbuildPort,
            path: url,
            method,
            headers,
          },
          (prxRes) => {
            res.writeHead(prxRes.statusCode!, prxRes.headers)
            prxRes.pipe(res, {end: true})
          },
        ),
        {end: true},
      )
    })

    const isCI = process.env.CI
    const portTries = isCI ? 1 : 10
    const portChosen = await tryMultiplePorts(
      defaultPort,
      portTries,
      proxyServer,
    )

    const hostedAt = `http://localhost:${portChosen}`

    console.log('Playground running at', hostedAt)

    // If not in CI, try to spawn a browser
    if (!isCI) {
      setTimeout(() => {
        if (!liveReload?.hasOpenConnections()) openForOS(hostedAt)
      }, 1000)
    }
  })

function openForOS(hostedAt: string) {
  const open = {
    darwin: ['open'],
    linux: ['xdg-open'],
    win32: ['cmd', '/c', 'start'],
  }
  const platform = process.platform as keyof typeof open
  if (open[platform]) {
    spawn(open[platform][0], [...open[platform].slice(1), hostedAt])
  } else {
    console.error(
      `Failed to open (${hostedAt}) for unconfigured platform (${platform})`,
    )
  }
}

async function tryMultiplePorts(
  port: number,
  tries: number,
  server: Server,
): Promise<number> {
  let portToTry = port
  let firstError = null
  let lastError = null

  while (portToTry < port + tries) {
    try {
      await new Promise((res, rej) => {
        const onListening = () => (rm(), res(true))
        const onError = () => (rm(), rej())
        const rm = () => {
          server.off('error', onError)
          server.off('listening', onListening)
        }

        server
          .listen(portToTry)
          .on('listening', onListening)
          .on('error', onError)
      })

      firstError = null
      lastError = null
      break // found a working port
    } catch (err) {
      if (!firstError) firstError = err
      lastError = err
      portToTry += 1
    }
  }

  if (firstError) {
    console.error(firstError)
    console.error(lastError)
    throw new Error(
      `Failed to find port starting at ${port} with ${tries} tries.`,
    )
  }

  return portToTry
}
