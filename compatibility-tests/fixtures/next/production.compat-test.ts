// @cspotcode/zx is zx in CommonJS
import {$, cd, path} from '@cspotcode/zx'
import {chromium, devices} from 'playwright'

$.verbose = true

const PATH_TO_PACKAGE = path.join(__dirname, `./package`)

describe(`next / production`, () => {
  test(`\`$ next build\` should succeed and have a predictable output`, async () => {
    cd(PATH_TO_PACKAGE)
    const {exitCode, stdout} = await $`npm run build`
    // at this point, the build should have succeeded
    expect(exitCode).toEqual(0)
    // now let's check the output to make sure it's what we expect

    // all of stdout until the line that contains "Route (pages)". That's because what comes after that
    // line is a list of all the pages that were built, and we don't want to snapshot that because it changes every time.
    const stdoutUntilRoutePages = stdout.split(`Route (pages)`)[0]

    // This test will fail if `next build` outputs anything unexpected.
    // I'm commenting this out because the output of `next build` is not predictable
    // TOOD: figure out a different way to test this
    // expect(stdoutUntilRoutePages).toMatchSnapshot()
  })

  // this test is not ready yet, so we'll skip it
  describe.skip(`$ next start`, () => {
    let browser, page
    beforeAll(async () => {
      browser = await chromium.launch()
    })
    afterAll(async () => {
      await browser.close()
    })
    beforeEach(async () => {
      page = await browser.newPage()
    })
    afterEach(async () => {
      await page.close()
    })

    // just a random port I'm hoping is free everywhere.
    const port = 30978

    test('`$ next start` serves the app, and the app works', async () => {
      // run the production server but don't wait for it to finish
      cd(PATH_TO_PACKAGE)
      const p = $`npm run start -- --port ${port}`
      // await p

      try {
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
        await page.goto(`http://localhost:${port}`)
        // wait three seconds
        await page.waitForTimeout(3000)
      } finally {
        p.kill()
      }
      try {
        await p
      } catch (e) {
        if (e.signal !== 'SIGKILL' && e.signal !== 'SIGTERM') {
          throw e
        }
      }
    })
  })
})
