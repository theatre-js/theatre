import {call, put, select} from 'redux-saga/effects'
import {bootstrapAction} from '$lf/common/actions'
import {reduceState} from '$shared/utils'
import {StoreState} from '$lf/types'
import getCurrentState from '$src/lb/lfController/endpointForLfs/getCurrentState.caller'

export default function* mirrorOfLBStateRootSaga(): Generator_<
  $FixMe,
  $FixMe,
  $FixMe
> {
  yield call(getInitialStateFromLB)
  yield put(bootstrapAction())
}

function* getInitialStateFromLB(): Generator_<$FixMe, $FixMe, $FixMe> {
  const state: StoreState = yield select()
  
  if (state.mirrorOfLBState) return
  const result = yield call(getCurrentState)
  yield reduceState(['mirrorOfLBState'], () => result)
}
