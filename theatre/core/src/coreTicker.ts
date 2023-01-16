import type {Ticker} from '@theatre/dataverse'
import {privateAPI} from './privateAPIs'
import type {IRafDriver, RafDriverPrivateAPI} from './rafDrivers'
import {createRafDriver} from './rafDrivers'

/**
 * Creates a rafDrive that uses `window.requestAnimationFrame` in browsers,
 * or a single `setTimeout` in SSR.
 */
function createBasicRafDriver(): IRafDriver {
  let rafId: number | null = null
  const start = (): void => {
    if (typeof window !== 'undefined') {
      const onAnimationFrame = (t: number) => {
        driver.tick(t)
        rafId = window.requestAnimationFrame(onAnimationFrame)
      }
      rafId = window.requestAnimationFrame(onAnimationFrame)
    } else {
      driver.tick(0)
      setTimeout(() => driver.tick(1), 0)
    }
  }

  const stop = (): void => {
    if (typeof window !== 'undefined') {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    } else {
      // nothing to do in SSR
    }
  }

  const driver = createRafDriver({name: 'DefaultCoreRafDriver', start, stop})

  return driver
}

let coreRafDriver: RafDriverPrivateAPI | undefined

/**
 * Returns the rafDriver that is used by the core internally. Creates a new one if it's not set yet.
 */
export function getCoreRafDriver(): RafDriverPrivateAPI {
  if (!coreRafDriver) {
    setCoreRafDriver(createBasicRafDriver())
  }
  return coreRafDriver!
}

/**
 *
 * @returns The ticker that is used by the core internally.
 */
export function getCoreTicker(): Ticker {
  return getCoreRafDriver().ticker
}

/**
 * Sets the rafDriver that is used by the core internally.
 */
export function setCoreRafDriver(driver: IRafDriver) {
  if (coreRafDriver) {
    throw new Error(`\`setCoreRafDriver()\` is already called.`)
  }
  const driverPrivateApi = privateAPI(driver)
  coreRafDriver = driverPrivateApi
}
