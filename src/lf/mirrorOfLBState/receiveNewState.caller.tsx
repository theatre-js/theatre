import _receiveNewState from './receiveNewState.endpointForLB'
import {callerFromLBToLF} from '$lb/lfController/sagas/callerFromLBToLF'

const receiveNewState: typeof _receiveNewState = callerFromLBToLF('receiveNewState')

export default receiveNewState
