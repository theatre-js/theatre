import {Ticker} from '@theatre/dataverse'

export class RAFTicker extends Ticker {
  static DEFAULT = new RAFTicker('DEFAULT')
  constructor(name?: string) {
    let lastReq: undefined | number
    super(() => {
      console.log(`tick ${name}`)
      if (lastReq != null) return // already scheduled
      lastReq = requestAnimationFrame(() => {
        lastReq = undefined
        this.tick()
      })
    })
  }
}
