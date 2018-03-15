import isPathAProject from './isPathAProject.endpointForLf'
import {callerFromLFToLB} from '$src/lf/commsWithLB/sagas'

const fn: typeof isPathAProject = callerFromLFToLB('isPathAProject')

export default fn
