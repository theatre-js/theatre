import {call} from 'redux-saga/effects'
import TheaterJSStudio from '$studio/bootstrap/TheaterJSStudio'

export default function* errorCatchingRootSaga(): Generator_<
  $FixMe,
  $FixMe,
  $FixMe
> {
  return yield call(rootSaga)
}

function* rootSaga(
  studio: TheaterJSStudio,
): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield null
}
