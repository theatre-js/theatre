import React from 'react'
import ReactDOM from 'react-dom/client'
import theatre from '@theatre/core'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
/**
 * This is a basic example of using Theatre.js for manipulating the DOM.
 */

theatre.init({studio: true})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={getProject('Sample project')} />,
)
