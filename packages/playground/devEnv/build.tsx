import {readdirSync} from 'fs'
import {writeFile, readFile} from 'fs/promises'
import path from 'path'
import type {BuildOptions} from 'esbuild'
import esbuild from 'esbuild'
import type {ServerResponse} from 'http'
import {definedGlobals} from '../../../theatre/devEnv/buildUtils'
import {mapValues} from 'lodash-es'
import {createServer, request} from 'http'
import {spawn} from 'child_process'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {Home} from './Home'

const playgroundDir = path.join(__dirname, '..')
const buildDir = path.join(playgroundDir, 'build')
const sharedDir = path.join(playgroundDir, 'src/shared')
const personalDir = path.join(playgroundDir, 'src/personal')
const testDir = path.join(playgroundDir, 'src/tests')

const dev = /^--dev|-d$/.test(process.argv[process.argv.length - 1])
const port = 8080

const clients: ServerResponse[] = []

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
            readdirSync(groupDir).map((moduleDir) => [
              path.basename(moduleDir),
              {
                entryDir: path.join(groupDir, moduleDir),
                outDir: path.join(buildDir, path.basename(groupDir), moduleDir),
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
  <Home groups={mapValues(groups, (group) => Object.keys(group))} />,
)

const config: BuildOptions = {
  entryPoints,
  bundle: true,
  sourcemap: true,
  outdir: path.join(playgroundDir, 'build'),
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
  banner: dev
    ? {
        js: ' (() => new EventSource("/esbuild").onmessage = () => location.reload())();',
      }
    : undefined,
  watch: dev && {
    onRebuild(error) {
      // Notify clients on rebuild
      clients.forEach((res) => res.write('data: update\n\n'))
      clients.length = 0
      console.log(error ? error : 'Reloading...')
    },
  },
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
  .then(() => {
    // Only start dev server in dev, otherwise just run build and that's it
    if (!dev) {
      return
    }

    // We start ESBuild serve with no build config because it doesn't need to build
    // anything, we are already using ESBuild watch.
    esbuild
      .serve({servedir: path.join(playgroundDir, 'build')}, {})
      .then(({port: esbuildPort}) => {
        // Create proxy
        createServer((req, res) => {
          const {url, method, headers} = req
          // If special /esbuild url requested, subscribe clients to changes
          if (req.url === '/esbuild') {
            return clients.push(
              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
              }),
            )
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
        }).listen(port, () => {
          console.log('Playground running at', 'http://localhost:' + port)
        })

        // If not in CI, try to spawn a browser
        if (!process.env.CI) {
          setTimeout(() => {
            const open = {
              darwin: ['open'],
              linux: ['xdg-open'],
              win32: ['cmd', '/c', 'start'],
            }
            const platform = process.platform as keyof typeof open
            if (clients.length === 0)
              spawn(open[platform][0], [
                ...open[platform].slice(1),
                `http://localhost:${port}`,
              ])
          }, 1000)
        }
      })
  })
