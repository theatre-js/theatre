import studio from '@theatre/studio'
import {getProject} from '@theatre/core'

studio.initialize({
  // __experimental_syncServer: 'wss://syncserver-kspg.onrender.com',
  serverUrl: 'http://localhost:3000',
  // usePersistentStorage: false,
})

const project = getProject('Syncing project')
const sheet = project.sheet('sheet')
const obj = sheet.object('obj', {x: 0, a: ''})

// onChange(obj.props, (props) => {})
