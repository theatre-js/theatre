import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
/**
 * This is a basic example of using Theatre.js for manipulating the DOM.
 */

studio.initialize()

ReactDOM.render(
  <Scene project={getProject('Sample project')} />,
  document.getElementById('root'),
)
