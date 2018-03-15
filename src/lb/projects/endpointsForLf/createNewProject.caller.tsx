import createNewProject from './createNewProject.endpointForLf'
import {callerFromLFToLB} from '$src/lf/commsWithLB/sagas'

const fn: typeof createNewProject = callerFromLFToLB('createNewProject')

export default fn
