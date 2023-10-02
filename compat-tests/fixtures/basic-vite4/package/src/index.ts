import {getProject} from '@theatre/core'

const project = getProject('Sample project')
const sheet = project.sheet('Scene')

if (import.meta.env.MODE === 'development') {
  const {default: studio} = await import('@theatre/studio')
  studio.initialize()
}
