import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import {createRafDriver} from '@theatre/core'

const rafDriver = createRafDriver({name: 'a custom 5fps raf driver'})
setInterval(() => {
  rafDriver.tick(performance.now())
}, 200)

studio.extend(extension)
studio.initialize({
  __experimental_rafDriver: rafDriver,
})

ReactDOM.render(<App rafDriver={rafDriver} />, document.getElementById('root'))
