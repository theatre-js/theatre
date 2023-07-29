// @cspotcode/zx is zx in CommonJS
import {$, cd, path, ProcessPromise} from '@cspotcode/zx'
import {defer, testServerAndPage} from '../../utils/testUtils'

$.verbose = false

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`react18`, () => {
  test(`build succeeds`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`npm run build`
    // at this point, the build should have succeeded
    expect(exitCode).toEqual(0)
  })

  // this one is failing for some reason, but manually running the server works fine
  describe(`build`, () => {
    function startServerOnPort(port: number): ProcessPromise<unknown> {
      cd(PATH_TO_PACKAGE)

      return $`npm start -- -p ${port}`
    }

    function waitTilServerIsReady(
      process: ProcessPromise<unknown>,
      port: number,
    ): Promise<{
      url: string
    }> {
      const d = defer<{url: string}>()

      const url = `http://localhost:${port}`

      process.stdout.on('data', (chunk) => {
        if (chunk.toString().includes('Accepting connections')) {
          //  server is running now
          d.resolve({url})
        }
      })

      return d.promise
    }

    testServerAndPage({startServerOnPort, waitTilServerIsReady})
  })
})
