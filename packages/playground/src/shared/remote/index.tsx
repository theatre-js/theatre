import React from 'react'
import ReactDOM from 'react-dom'
import studio from '@theatre/studio'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import RemoteController from './RemoteController'

const project = getProject('Sample project')
studio.initialize()
RemoteController(project)

ReactDOM.render(<Scene />, document.getElementById('root'))
