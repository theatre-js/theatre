import recogniseProject from './recogniseProject.endpointForLf'
import {callerFromLFToLB} from '$src/lf/commsWithLB/sagas'

const fn: typeof recogniseProject = callerFromLFToLB('recogniseProject')

export default fn
