import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {LazyLoadStudio} from '../../common/LazyLoadStudio'

ReactDOM.render(
  <React.StrictMode>
    <App />
    <LazyLoadStudio import={() => import('./loadStudio')} />
  </React.StrictMode>,
  document.getElementById('root'),
)
