
import createNewProject from './createNewProject.lfEndpoint'
import {makeLFCaller} from '$lb/common/utils'

const fn: typeof createNewProject = makeLFCaller('createNewProject')

export default fn
