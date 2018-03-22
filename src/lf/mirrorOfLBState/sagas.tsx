import {call, put, select} from 'redux-saga/effects'
import {StoreState} from '$lf/types'
import getCurrentState from '$src/lb/lfController/endpointForLfs/getCurrentState.caller'
import {
  bootstrapAction,
  reduceStateAction,
} from '$shared/utils/redux/commonActions'

export default function* mirrorOfLBStateRootSaga(): Generator_ {
  yield call(getInitialStateFromLB)
  yield put(bootstrapAction())
}

function* getInitialStateFromLB(): Generator_<$FixMe> {
  const state: StoreState = yield select()

  if (state.mirrorOfLBState) return
  const result = yield call(getCurrentState)
  yield put(reduceStateAction(['mirrorOfLBState'], () => result))
}
