import {call, setContext, getContext, fork} from 'redux-saga/effects'
import TheaterJSStudio from '$studio/bootstrap/TheaterJSStudio'
import statePersistenceSaga from '$src/studio/statePersistence/sagas'

export default function* errorCatchingRootSaga(
  studio: TheaterJSStudio,
): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield call(rootSaga, studio)
}

const studioContextName = '@@@theaterjs/studioContext'

export function* getStudio(): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield getContext(studioContextName)
}

function* rootSaga(
  studio: TheaterJSStudio,
): Generator_<$FixMe, $FixMe, $FixMe> {
  yield setContext({[studioContextName]: studio})
  yield fork(statePersistenceSaga)
}

export function* startStudio(projectPath: string): Generator_<$FixMe, $FixMe, $FixMe> {
  console.log('should start with', projectPath);
  
}