import {Ticker} from '@theatre/dataverse'

const coreTicker = new Ticker()

export default coreTicker

/**
 * @todo users should also be able to define their own ticker.
 */
const onAnimationFrame = (t: number) => {
  coreTicker.tick(t)
  window.requestAnimationFrame(onAnimationFrame)
}
window.requestAnimationFrame(onAnimationFrame)
