import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import getStudio from '@theatre/studio/getStudio'

const studioPrivate = getStudio()

studio.extend(extension)
studio.initialize()

ReactDOM.render(<App />, document.getElementById('root'))

const raf = studioPrivate.ticker

// Show "ticks per second" information in performance measurements using the User Timing API
// See https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API
// See https://web.dev/user-timings/
setInterval(() => {
  const start = {
    ticks: raf.__ticks,
    now: Date.now(),
  }
  const id = start.now.toString(36) + 'fps'
  performance.mark(id)
  setTimeout(() => {
    const ticksPerSec =
      ((raf.__ticks - start.ticks) * 1000) / (Date.now() - start.now)
    // This shows up in the performance tab of devtools if you record!
    performance.measure(
      `${ticksPerSec.toFixed(0)}t/1s - ${(ticksPerSec * 0.5).toFixed(
        0,
      )}t/500ms`,
      id,
    )
  }, 2000)
}, 500)
