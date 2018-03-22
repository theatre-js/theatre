import {fork, call} from 'redux-saga/effects'
import lfControllerSaga from '$lb/lfController/sagas'
import statePersistorSaga from '$lb/statePersistor/sagas'
import studioCommsSaga from '$lb/studioComms/sagas'
import projectsSaga from '$src/lb/projects/projectsSagas'

export default function* errorCatchingRootSaga(): Generator_ {
  return yield call(rootSaga)
}

function* rootSaga(): Generator_ {
  yield [
    fork(statePersistorSaga),
    fork(lfControllerSaga),
    fork(studioCommsSaga),
    fork(projectsSaga),
  ]
}
