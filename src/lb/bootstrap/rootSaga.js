// @flow
import {fork, call} from 'redux-saga/effects'
import launcherWindowSaga from '$lb/launcherWindow/sagas'

export default function* errorCatchingRootSaga(): Generator<> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator<> {
  yield [
    fork(launcherWindowSaga),
  ]
}