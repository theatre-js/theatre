import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import theatre from '@theatre/core'
import extension from '@theatre/r3f/dist/extension'

theatre.getStudio().then((studio) => studio.extend(extension))
theatre.init({studio: true, serverUrl: 'http://localhost:3000'})

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
