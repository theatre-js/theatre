// @flow
import {_multiReduceState} from './multiReduceState'
import {call} from 'redux-saga/effects'

type Path = Array<string | number>

function* _reduceState(path: Path, reducer: Function, providedState?: $IntentionalAny): Generator<> {
  return yield call(_multiReduceState, [{path, reducer}], providedState)
}

export default function reduceState(path: Path, reducer: Function, providedState?: $IntentionalAny) {
  return call(_reduceState, path, reducer, providedState)
}