import React from 'react'
import ReactDOM from 'react-dom/client'
import theatre from '@theatre/core'
import {getProject} from '@theatre/core'
import {Scene} from './Scene'
import RemoteController from './RemoteController'

const project = getProject('Sample project')
theatre.init({studio: true})
RemoteController(project)

ReactDOM.createRoot(document.getElementById('root')!).render(<Scene />)
