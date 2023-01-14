import {Ticker} from '@theatre/dataverse'
import {setPrivateAPI} from './privateAPIs'

export interface IRafDriver {
  /**
   * All raf derivers have have `driver.type === 'Theatre_RafDriver_PublicAPI'`
   */
  readonly type: 'Theatre_RafDriver_PublicAPI'
  name: string
  id: number
  tick: (time: number) => void
}

export interface RafDriverPrivateAPI {
  readonly type: 'Theatre_RafDriver_PrivateAPI'
  publicApi: IRafDriver
  ticker: Ticker
  start?: () => void
  stop?: () => void
}

let lastDriverId = 0

export function createRafDriver(conf?: {
  name?: string
  start?: () => void
  stop?: () => void
}): IRafDriver {
  const tick = (time: number): void => {
    ticker.tick(time)
  }

  const ticker = new Ticker({
    onActive() {
      conf?.start?.()
    },
    onDormant() {
      conf?.stop?.()
    },
  })

  const driverPublicApi: IRafDriver = {
    tick,
    id: lastDriverId++,
    name: conf?.name ?? `CustomRafDriver-${lastDriverId}`,
    type: 'Theatre_RafDriver_PublicAPI',
  }

  const driverPrivateApi: RafDriverPrivateAPI = {
    type: 'Theatre_RafDriver_PrivateAPI',
    publicApi: driverPublicApi,
    ticker,
    start: conf?.start,
    stop: conf?.stop,
  }

  setPrivateAPI(driverPublicApi, driverPrivateApi)

  return driverPublicApi
}
