// @flow
import {call} from 'redux-saga/effects'

export default function* errorCatchingRootSaga(): Generator<> {
  return yield call(rootSaga)
}

function* rootSaga(): Generator<> {
  return yield null
}