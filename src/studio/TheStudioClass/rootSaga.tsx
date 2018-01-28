// @flow
import {call} from 'redux-saga/effects'
import {default as TheStudioClass} from '$studio/TheStudioClass'

export default function* errorCatchingRootSaga(): Generator_<
  $FixMe,
  $FixMe,
  $FixMe
> {
  return yield call(rootSaga)
}

// eslint-disable-next-line no-unused-vars
function* rootSaga(studio: TheStudioClass): Generator_<$FixMe, $FixMe, $FixMe> {
  return yield null
}
