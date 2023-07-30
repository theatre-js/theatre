import ReactDOM from 'react-dom'
import React from 'react'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import App from './App/App'

console.log(React)

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  studio.extend(extension)
  studio.initialize({usePersistentStorage: false})
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)
