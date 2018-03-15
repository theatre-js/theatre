// @flow
// import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import SampleApp from './SampleApp'

window.TheaterJS.run('')

render(<SampleApp />, (document.getElementById('root')))
