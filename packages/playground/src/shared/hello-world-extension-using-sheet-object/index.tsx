import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {LazyLoadStudio} from '../../common/LazyLoadStudio'

ReactDOM.render(
  <>
    <App />
    <LazyLoadStudio import={() => import('./loadStudio')} autoLoad />
  </>,
  document.getElementById('root'),
)
