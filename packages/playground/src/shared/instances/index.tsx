import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import theatre from '@theatre/core'
import extension from '@theatre/r3f/dist/extension'

void theatre.getStudio().then((studio) => studio.extend(extension))
void theatre.init({studio: true})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
