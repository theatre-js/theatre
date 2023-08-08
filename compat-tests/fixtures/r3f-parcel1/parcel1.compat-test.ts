// @cspotcode/zx is zx in CommonJS
import {$, cd, path, ProcessPromise} from '@cspotcode/zx'
import {defer, testServerAndPage} from '../../utils/testUtils'

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`parcel1`, () => {
  test(`build succeeds`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode} = await $`npm run build`
    // at this point, the build should have succeeded
    expect(exitCode).toEqual(0)
  })

  describe(`build`, () => {
    function startServerOnPort(port: number): ProcessPromise<unknown> {
      cd(PATH_TO_PACKAGE)

      return $`npm start -- -p ${port}`
    }

    testServerAndPage({
      startServerOnPort,
      checkServerStdoutToSeeIfItsReady: (chunk) =>
        chunk.includes('Accepting connections'),
    })
  })

  describe(`dev`, () => {
    function startServerOnPort(port: number): ProcessPromise<unknown> {
      cd(PATH_TO_PACKAGE)

      return $`npm run dev -- -p ${port}`
    }

    testServerAndPage({
      startServerOnPort,
      checkServerStdoutToSeeIfItsReady: (chunk) =>
        chunk.includes('Server running at'),
    })
  })
})
