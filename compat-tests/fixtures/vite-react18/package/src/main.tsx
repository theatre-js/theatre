import ReactDOM from 'react-dom/client'
import studio from '@theatre/studio'
import extension from '@theatre/r3f/dist/extension'
import App from './App'

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  studio.extend(extension)
  studio.initialize({usePersistentStorage: false})
}

const container = document.getElementById('root')!
const root = ReactDOM.createRoot(container)
root.render(<App />)
