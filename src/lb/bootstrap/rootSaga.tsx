// @flow
import {fork, call} from 'redux-saga/effects'
import launcherWindowSaga from '$lb/launcherWindow/sagas'
import statePersistorSaga from '$lb/statePersistor/sagas'
import studioServerSaga from '$lb/studioServer/sagas'

export default function* errorCatchingRootSaga(): Generator_<*, *, *> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator_<*, *, *> {
  yield [
    fork(statePersistorSaga),
    fork(launcherWindowSaga),
    fork(studioServerSaga),
  ]
}
