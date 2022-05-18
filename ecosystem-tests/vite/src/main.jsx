import ReactDOM from 'react-dom'
import './index.css'
import '@theatre/studio'
import {getProject} from '@theatre/core'
import React from 'react'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <App project={getProject('CRA project')} />
  </React.StrictMode>,
  document.getElementById('root'),
)
