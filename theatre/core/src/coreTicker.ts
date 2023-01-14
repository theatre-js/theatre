import type {Ticker} from '@theatre/dataverse'
import {privateAPI} from './privateAPIs'
import type {IRafDriver, RafDriverPrivateAPI} from './rafDrivers'
import {createRafDriver} from './rafDrivers'

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

export function getCoreRafDriver(): RafDriverPrivateAPI {
  if (!coreRafDriver) {
    setCoreRafDriver(createBasicRafDriver())
  }
  return coreRafDriver!
}

export function getCoreTicker(): Ticker {
  return getCoreRafDriver().ticker
}

export function setCoreRafDriver(driver: IRafDriver) {
  if (coreRafDriver) {
    throw new Error(`\`setCoreRafDriver()\` is already called.`)
  }
  const driverPrivateApi = privateAPI(driver)
  coreRafDriver = driverPrivateApi
}
