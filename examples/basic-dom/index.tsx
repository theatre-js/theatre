import React from 'react'
import ReactDOM from 'react-dom/client'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'

studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={getProject('Sample project')} />,
)
