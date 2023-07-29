// @cspotcode/zx is zx in CommonJS
import {$, cd, path, ProcessPromise} from '@cspotcode/zx'
import {testServerAndPage} from '../../utils/testUtils'

$.verbose = false

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`vite2`, () => {
  test(`\`$ vite build\` should succeed`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`npm run build`
    // at this point, the build should have succeeded
    expect(exitCode).toEqual(0)
  })

  describe(`vite preview`, () => {
    function startServerOnPort(port: number): ProcessPromise<unknown> {
      cd(PATH_TO_PACKAGE)

      return $`npm run preview -- --port ${port}`
    }

    async function waitTilServerIsReady(
      process: ProcessPromise<unknown>,
      port: number,
    ): Promise<{
      url: string
    }> {
      for await (const chunk of process.stdout) {
        if (chunk.toString().includes('--host')) {
          // vite's server is running now
          break
        }
      }

      return {url: `http://localhost:${port}`}
    }

    testServerAndPage({startServerOnPort, waitTilServerIsReady})
  })
})
