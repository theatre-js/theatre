// @flow
import {call} from 'redux-saga/effects'
import type {default as TheStudioClass} from '$studio/TheStudioClass'

export default function* errorCatchingRootSaga(): Generator<*, *, *> {
  return yield call(rootSaga)
}

function* rootSaga(studio: TheStudioClass): Generator<*, *, *> { // eslint-disable-line no-unused-vars
  return yield null
}