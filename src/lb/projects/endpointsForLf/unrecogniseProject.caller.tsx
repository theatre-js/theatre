import unrecogniseProject from './unrecogniseProject.endpointForLf'
import {callerFromLFToLB} from '$src/lf/commsWithLB/sagas'

const fn: typeof unrecogniseProject = callerFromLFToLB('unrecogniseProject')

export default fn
