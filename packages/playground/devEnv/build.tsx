import {existsSync, readdirSync, readFileSync, writeFileSync} from 'fs'
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
import {Home} from './buildIndex'

const playgroundDir = path.join(__dirname, '..')
const buildDir = path.join(playgroundDir, 'build')
const sharedDir = path.join(playgroundDir, 'src/shared')
const personalDir = path.join(playgroundDir, 'src/personal')
const testDir = path.join(playgroundDir, 'src/tests')

const dev = /^--dev|-d$/.test(process.argv[process.argv.length - 1])
const port = 8080

const clients: ServerResponse[] = []

const groups = Object.fromEntries(
  [sharedDir, personalDir, testDir]
    .filter((dir) => existsSync(dir))
    .map((groupDir) => {
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
    }),
)

const entryPoints = Object.values(groups)
  .flatMap((group) => Object.values(group))
  .map((module) => path.join(module.entryDir, 'index.tsx'))

const outDirs = Object.values(groups).flatMap((group) =>
  Object.values(group).map((module) => module.outDir),
)

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
}

esbuild
  .build({
    ...config,
    watch: dev && {
      onRebuild(error) {
        clients.forEach((res) => res.write('data: update\n\n'))
        clients.length = 0
        console.log(error ? error : 'Reloading...')
      },
    },
  })
  .then(() => {
    const index = readFileSync(
      path.join(playgroundDir, 'src/index.html'),
      'utf8',
    )
    writeFileSync(
      path.join(buildDir, 'index.html'),
      index.replace(/<body>[\s\S]*<\/body>/, `<body>${homeHtml}</body>`),
    )
    for (const entry of outDirs) {
      writeFileSync(
        path.join(entry, 'index.html'),
        index.replace(
          '%ENTRYPOINT%',
          path.join('/', path.relative(buildDir, entry), 'index.js'),
        ),
      )
    }
  })
  .catch((err) => {
    console.log(err)
    return process.exit(1)
  })

if (dev) {
  esbuild
    .serve({servedir: path.join(playgroundDir, 'build')}, config)
    .then(({port: esbuildPort}) => {
      createServer((req, res) => {
        const {url, method, headers} = req
        if (req.url === '/esbuild') {
          return clients.push(
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            }),
          )
        }
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
}
