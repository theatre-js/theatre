import {Ticker} from '@theatre/dataverse'
import type {VoidFn} from './types'

export type DefaultTicker = {
  ticker: Ticker
  enableDefaultTicker: VoidFn
  disableDefaultTicker: VoidFn
}

export default function defaultTickerFactory(): DefaultTicker {
  const ticker = new Ticker()

  let defaultTickerEnabled = true
  let animationFrameRequestId: number | null = null

  function enableDefaultTicker() {
    if (!defaultTickerEnabled) {
      defaultTickerEnabled = true
      maybeRequestAnimationFrame()
    }
  }

  function disableDefaultTicker() {
    defaultTickerEnabled = false
    if (animationFrameRequestId) {
      window.cancelAnimationFrame(animationFrameRequestId)
      animationFrameRequestId = null
    }
  }

  function maybeRequestAnimationFrame() {
    if (defaultTickerEnabled && !animationFrameRequestId) {
      animationFrameRequestId = window.requestAnimationFrame(onAnimationFrame)
    }
  }

  function onAnimationFrame(t: number) {
    animationFrameRequestId = null
    ticker.tick(t)
    maybeRequestAnimationFrame()
  }

  maybeRequestAnimationFrame()

  return {
    ticker,
    enableDefaultTicker,
    disableDefaultTicker,
  }
}
