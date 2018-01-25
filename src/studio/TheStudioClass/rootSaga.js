// @flow
import {call} from 'redux-saga/effects'
import type {default as TheStudioClass} from '$studio/TheStudioClass'

export default function* errorCatchingRootSaga(): Generator_<*, *, *> {
  return yield call(rootSaga)
}

// eslint-disable-next-line no-unused-vars
function* rootSaga(studio: TheStudioClass): Generator_<*, *, *> {
  return yield null
}
