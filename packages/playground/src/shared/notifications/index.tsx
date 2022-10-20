import React from 'react'
import ReactDOM from 'react-dom'
import studio, {notify} from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
/**
 * This is a basic example of using Theatre.js for manipulating the DOM.
 *
 * It also uses {@link IStudio.selection | studio.selection} to customize
 * the selection behavior.
 */

studio.initialize()

// trigger warning
getProject('Sample project').sheet('Scene').sequence.play()

notify.info(
  'Welcome to the Theatre.js playground!',
  'This is a basic example of using Theatre.js for manipulating the DOM.',
)

getProject('Sample project').ready.then(() => {
  notify.success(
    'Project loaded!',
    'Now you can start calling `sequence.play()` to trigger animations. ;)',
  )
})

ReactDOM.render(
  <Scene
    project={getProject('Sample project', {
      // experiments: {
      //   logging: {
      //     internal: true,
      //     dev: true,
      //     min: TheatreLoggerLevel.TRACE,
      //   },
      // },
    })}
  />,
  document.getElementById('root'),
)
