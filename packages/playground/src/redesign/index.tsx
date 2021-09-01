import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import bg from '../../xeno/bgs/8.png'

studio.initialize()

document.body.style.cssText = `
  background-image: url(${bg});
  background-color: #3A3A39;
  background-position: center bottom;
  background-size: calc(100% - 0px);
  background-repeat: no-repeat;
`
;(function renderDragArea() {
  const div = document.createElement('div')
  div.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 80px;
    height: 20px;
    -webkit-app-region: drag;
  `
  document.body.appendChild(div)
})()

ReactDOM.render(
  <Scene project={getProject('Sample project')} />,
  document.getElementById('root'),
)
