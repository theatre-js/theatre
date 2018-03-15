import _getCurrentState from './getCurrentState.endpointForLf'
import {callerFromLFToLB} from '$src/lf/commsWithLB/sagas'

const getCurrentState: typeof _getCurrentState = callerFromLFToLB(
  'getCurrentState',
)

export default getCurrentState
