import React from 'react'
import ReactDOM from 'react-dom/client'
import theatre from '@theatre/core'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'

/**
 * This is a basic example of using Theatre.js for manipulating the DOM.
 *
 * It also uses {@link IStudio.selection | studio.selection} to customize
 * the selection behavior.
 */

void theatre.init({studio: true})

ReactDOM.createRoot(document.getElementById('root')!).render(
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
)
