// @flow
import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import App from '$lf/bootstrap/components/App'

render(<App />, document.getElementById('root'))