import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import ThreeScene from './ThreeScene'

studio.initialize()

ReactDOM.render(
  <ThreeScene project={getProject('Three Basic')} />,
  document.getElementById('root'),
)
