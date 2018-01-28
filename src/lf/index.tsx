// @flow
import 'babel-polyfill'

import * as React from 'react'
import {render} from 'react-dom'
import App from '$lf/bootstrap/components/App'

render(<App />, document.getElementById('root') as $FixMe)
