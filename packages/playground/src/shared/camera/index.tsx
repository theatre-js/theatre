import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'

studio.extend(extension)
studio.initialize()

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
