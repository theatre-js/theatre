import {call, setContext, getContext, fork, put, select} from 'redux-saga/effects'
import Studio from '$studio/bootstrap/Studio'
import statePersistenceSaga from '$src/studio/statePersistence/sagas'
import {ahistoricalAction} from '$shared/utils/redux/withHistory/actions'
import {reduceStateAction} from '$shared/utils/redux/commonActions'

export default function* errorCatchingRootSaga(
  studio: Studio,
): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield call(rootSaga, studio)
}

const studioContextName = 'theaterjsStudio'

export function* getStudio() {
  return getContext(studioContextName)
}

function* rootSaga(
  studio: Studio,
): Generator_<$FixMe, $FixMe, $FixMe> {
  yield setContext({[studioContextName]: studio})
  yield fork(statePersistenceSaga)
}

export function* runStudio(
  pathToProject: string,
): Generator_<$FixMe, $FixMe, $FixMe> {
  yield put(
    ahistoricalAction(reduceStateAction(['pathToProject'], () => pathToProject)),
  )
}
