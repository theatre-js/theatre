// @flow
import {fork, call} from 'redux-saga/effects'
import launcherWindowSaga from '$lb/launcherWindow/sagas'
import statePersistorSaga from '$lb/statePersistor/sagas'
import studioServerSaga from '$lb/studioServer/sagas'

export default function* errorCatchingRootSaga(): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator_<$FixMe, $FixMe, $FixMe> {
  yield [
    fork(statePersistorSaga),
    fork(launcherWindowSaga),
    fork(studioServerSaga),
  ]
}
