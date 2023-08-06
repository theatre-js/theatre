import React from 'react'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import App from '../src/App/App'

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  studio.extend(extension)
  studio.initialize({usePersistentStorage: false})
}

export default function Home() {
  return <App></App>
}
