// @flow
// import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import SampleApp from './SampleApp'

window.TheaterJS.run('/Users/aria/theaterjs/sample-app/theater.json')

render(<SampleApp />, (document.getElementById('root')))
