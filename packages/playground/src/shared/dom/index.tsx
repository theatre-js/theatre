import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import {TheatreLoggerLevel} from '@theatre/shared/logger'
/**
 * This is a basic example of using Theatre for manipulating the DOM.
 *
 * It also uses {@link IStudio.selection | studio.selection} to customize
 * the selection behavior.
 */

studio.initialize()

ReactDOM.render(
  <Scene
    project={getProject('Sample project', {
      experiments: {
        logging: {
          internal: true,
          dev: true,
          min: TheatreLoggerLevel.TRACE,
        },
      },
    })}
  />,
  document.getElementById('root'),
)
