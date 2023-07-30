import {Browser, chromium, ConsoleMessage, devices, Page} from 'playwright'
import {ProcessPromise} from '@cspotcode/zx'

export function testServerAndPage({
  startServerOnPort,
  checkServerStdoutToSeeIfItsReady,
}: {
  startServerOnPort: (port: number) => ProcessPromise<unknown>

  checkServerStdoutToSeeIfItsReady: (chunk: string) => boolean
}) {
  if (checkServerStdoutToSeeIfItsReady('') !== false) {
    throw new Error(
      `Incorrect test setup. checkServerStdoutToSeeIfItsReady should return false for an empty string.`,
    )
  }
  const waitTilServerIsReady = async (
    process: ProcessPromise<unknown>,
  ): Promise<void> => {
    const d = defer<void>()

    process.stdout.on('data', (chunk) => {
      if (checkServerStdoutToSeeIfItsReady(chunk.toString())) {
        //  server is ready
        d.resolve()
      }
    })

    await Promise.race([
      d.promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(`Server wasn't ready after 30 seconds`), 30000),
      ),
    ])

    return d.promise
  }
  let browser: Browser, page: Page
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

  test('The server runs, and the r3f setup works', async () => {
    // run the production server but don't wait for it to finish

    // just a random port I'm hoping is free everywhere.
    const port = await findOpenPort()
    let process: ProcessPromise<unknown> | undefined
    try {
      process = startServerOnPort(port)
    } catch (err) {
      throw new Error(`Failed to start server: ${err}`)
    }

    const url = `http://localhost:${port}`

    try {
      await waitTilServerIsReady(process)

      await testTheatreOnPage(page, {url})
    } finally {
      // kill the server
      await process.kill('SIGTERM')
    }

    try {
      await process
    } catch (e) {
      if (e.signal !== 'SIGTERM') {
        console.log('process exited with error', e)

        // if it exited for any reason other than us killing it, re-throw the error
        throw e
      }
      // otherwise, process exited because we killed it, which is what we wanted
    }
  })
}

async function testTheatreOnPage(page: Page, {url}: {url: string}) {
  const d = defer<string>()

  const processConsoleEvents = (msg: ConsoleMessage) => {
    const text = msg.text()
    if (text.startsWith('Test passed: light2.intensity')) {
      d.resolve('Passed')
    } else if (text.startsWith('Test failed: light2.intensity')) {
      d.reject(text)
    }
  }

  page.on('console', processConsoleEvents)

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // give the console listener 3 seconds to resolve, otherwise fail the test
    await Promise.race([
      d.promise,
      new Promise((_, reject) => setTimeout(() => reject('Timed out'), 30000)),
    ])
  } finally {
    page.off('console', processConsoleEvents)
  }
}

export function findOpenPort(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const server = require('net').createServer()
    server.unref()
    server.on('error', reject)
    server.listen(0, () => {
      const {port} = server.address() as {port: number}
      server.close(() => {
        resolve(port)
      })
    })
  })
}

interface Deferred<PromiseType> {
  resolve: (d: PromiseType) => void
  reject: (d: unknown) => void
  promise: Promise<PromiseType>
  status: 'pending' | 'resolved' | 'rejected'
}

/**
 * A simple imperative API for resolving/rejecting a promise.
 *
 * Example:
 * ```ts
 * function doSomethingAsync() {
 *  const deferred = defer()
 *
 *  setTimeout(() => {
 *    if (Math.random() > 0.5) {
 *      deferred.resolve('success')
 *    } else {
 *      deferred.reject('Something went wrong')
 *    }
 *  }, 1000)
 *
 *  // we're just returning the promise, so that the caller cannot resolve/reject it
 *  return deferred.promise
 * }
 *
 * ```
 */
export function defer<PromiseType>(): Deferred<PromiseType> {
  let resolve: (d: PromiseType) => void
  let reject: (d: unknown) => void
  const promise = new Promise<PromiseType>((rs, rj) => {
    resolve = (v) => {
      rs(v)
      deferred.status = 'resolved'
    }
    reject = (v) => {
      rj(v)
      deferred.status = 'rejected'
    }
  })

  const deferred: Deferred<PromiseType> = {
    resolve: resolve!,
    reject: reject!,
    promise,
    status: 'pending',
  }
  return deferred
}
