import {fork, call} from 'redux-saga/effects'
import mirrorOfLBStateRootSaga from '$lf/mirrorOfLBState/sagas'
import commsWithLBSaga from '$lf/commsWithLB/sagas'

export default function* errorCatchingRootSaga(): Generator_ {
  return yield call(rootSaga)
}

function* rootSaga(): Generator_<$FixMe> {
  yield fork(commsWithLBSaga)
  yield fork(mirrorOfLBStateRootSaga)
}
