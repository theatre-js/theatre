import {Ticker} from '@theatre/dataverse'

const coreTicker = new Ticker()

export default coreTicker

if (typeof window !== 'undefined') {
  /**
   * @remarks
   * TODO users should also be able to define their own ticker.
   */
  const onAnimationFrame = (t: number) => {
    coreTicker.tick(t)
    window.requestAnimationFrame(onAnimationFrame)
  }
  window.requestAnimationFrame(onAnimationFrame)
} else {
  coreTicker.tick(0)
  setTimeout(() => coreTicker.tick(1), 0)
  console.log(
    `@theatre/core is running in a server rather than in a browser. We haven't gotten around to testing server-side rendering, so if something is working in the browser but not on the server, please file a bug: https://github.com/theatre-js/theatre/issues/new`,
  )
}
