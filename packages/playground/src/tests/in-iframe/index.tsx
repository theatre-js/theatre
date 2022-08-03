import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(
  <iframe
    src="/shared/dom"
    style={{width: '600px', height: '600px'}}
    sandbox="allow-scripts allow-same-origin"
  />,
  document.getElementById('root'),
)
