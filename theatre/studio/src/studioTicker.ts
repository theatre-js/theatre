import {Ticker} from '@theatre/dataverse'

const studioTicker = new Ticker()

export default studioTicker

if (typeof window !== 'undefined') {
  /**
   * @remarks
   * TODO users should also be able to define their own ticker.
   */
  const onAnimationFrame = (t: number) => {
    studioTicker.tick(t)
    window.requestAnimationFrame(onAnimationFrame)
  }
  window.requestAnimationFrame(onAnimationFrame)
} else {
  studioTicker.tick(0)
  setTimeout(() => studioTicker.tick(1), 0)
  console.log(
    `@theatre/studio is running in a server rather than in a browser. We haven't gotten around to testing server-side rendering, so if something is working in the browser but not on the server, please file a bug: https://github.com/theatre-js/theatre/issues/new`,
  )
}
