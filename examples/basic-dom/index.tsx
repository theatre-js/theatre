import React from 'react'
import ReactDOM from 'react-dom/client'
import theatre, {getProject} from '@theatre/core'
import {Scene} from './Scene'

void theatre.init({studio: true})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Scene project={getProject('Sample project')} />,
)
