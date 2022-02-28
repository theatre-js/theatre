import {Ticker} from '@theatre/dataverse'

const coreTicker = new Ticker()

export default coreTicker

let defaultTickerEnabled = true

export function enableDefaultTicker() {
  if (!defaultTickerEnabled) {
    defaultTickerEnabled = true
    window.requestAnimationFrame(onAnimationFrame)
  }
}

export function disableDefaultTicker() {
  defaultTickerEnabled = false
}

const onAnimationFrame = (t: number) => {
  coreTicker.tick(t)
  if (defaultTickerEnabled) window.requestAnimationFrame(onAnimationFrame)
}
if (defaultTickerEnabled) window.requestAnimationFrame(onAnimationFrame)
