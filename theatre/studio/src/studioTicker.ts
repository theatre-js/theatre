import {Ticker} from '@theatre/dataverse'

const studioTicker = new Ticker()

export default studioTicker

/**
 * @todo users should also be able to define their own ticker.
 */
const onAnimationFrame = (t: number) => {
  studioTicker.tick(t)
  window.requestAnimationFrame(onAnimationFrame)
}
window.requestAnimationFrame(onAnimationFrame)
