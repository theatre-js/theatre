import React from 'react'
import {render} from 'react-dom'
import SampleApp from './SampleApp'
import {join} from 'path'

const pathToProject = join(process.env.PATH_TO_ROOT, 'examples/studio.json')

window.TheatreJS.run(pathToProject, __dirname)

render(<SampleApp />, (document.getElementById('root')))
