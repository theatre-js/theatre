// @cspotcode/zx is zx in CommonJS
import {$, cd, path, ProcessPromise} from '@cspotcode/zx'
import {testServerAndPage} from '../../utils/testUtils'

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

    testServerAndPage({
      startServerOnPort,
      checkServerStdoutToSeeIfItsReady: (chunk) => chunk.includes('--host'),
    })
  })

  describe(`vite dev`, () => {
    function startServerOnPort(port: number): ProcessPromise<unknown> {
      cd(PATH_TO_PACKAGE)

      return $`npm run dev -- --port ${port}`
    }

    testServerAndPage({
      startServerOnPort,
      checkServerStdoutToSeeIfItsReady: (chunk) => chunk.includes('--host'),
    })
  })
})
