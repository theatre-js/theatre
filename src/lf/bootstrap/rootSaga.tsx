// @flow
import {fork, call} from 'redux-saga/effects'
import mirrorOfLBStateRootSaga from '$lf/mirrorOfLBState/sagas'

export default function* errorCatchingRootSaga(): Generator_<*, *, *> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator_<*, *, *> {
  yield fork(mirrorOfLBStateRootSaga)
}
