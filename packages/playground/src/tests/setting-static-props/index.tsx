import studio from '@theatre/studio'
import {getProject} from '@theatre/core'

studio.initialize({usePersistentStorage: false})

const project = getProject('sample project')
const sheet = project.sheet('sample sheet')
const obj = sheet.object('sample object', {
  position: {
    x: 0,
    y: 0,
  },
})
