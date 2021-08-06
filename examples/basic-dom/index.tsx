import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'

studio.ui

ReactDOM.render(
  <Scene project={getProject('Sample project')} />,
  document.getElementById('root'),
)
