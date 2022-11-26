import {Ticker} from '@theatre/dataverse'

let coreTicker: Ticker

export function setCoreTicker(ticker: Ticker) {
  if (coreTicker) {
    throw new Error(`coreTicker is already set`)
  }
  coreTicker = ticker
}

export function getCoreTicker(): Ticker {
  if (!coreTicker) {
    coreTicker = Ticker.raf
  }
  return coreTicker
}
