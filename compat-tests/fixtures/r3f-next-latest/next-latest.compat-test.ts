// @cspotcode/zx is zx in CommonJS
import {$, cd, path, ProcessPromise} from '@cspotcode/zx'
import {testServerAndPage} from '../../utils/testUtils'

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`next`, () => {
  describe(`build`, () => {
    test(`command runs without error`, async () => {
      cd(PATH_TO_PACKAGE)
      const {exitCode} = await $`npm run build`
      // at this point, the build should have succeeded
      expect(exitCode).toEqual(0)
    })

    describe(`next start`, () => {
      testServerAndPage({
        startServerOnPort: (port: number) => {
          cd(PATH_TO_PACKAGE)

          return $`npm run start -- --port ${port}`
        },

        checkServerStdoutToSeeIfItsReady: (chunk) =>
          chunk.includes('started server'),
      })
    })
  })

  // this test is not ready yet, so we'll skip it
  describe(`$ next dev`, () => {
    testServerAndPage({
      startServerOnPort: (port: number) => {
        cd(PATH_TO_PACKAGE)

        return $`npm run dev -- --port ${port}`
      },
      checkServerStdoutToSeeIfItsReady: (chunk) =>
        chunk.includes('compiled client and server successfully'),
    })
  })
})
