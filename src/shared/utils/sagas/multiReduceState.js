// @flow
import {select, put} from 'redux-saga/effects'
import {call} from 'redux-saga/effects'
import update from 'lodash/fp/update'

type Path = Array<string | number>

export type Pair = {
  path: Path,
  reducer: Function,
}

export default function(pairs: Array<Pair>, providedState?: $IntentionalAny) {
  return call(_multiReduceState, pairs, providedState)
}

export function* _multiReduceState(
  pairs: Array<Pair>,
  providedState?: $IntentionalAny,
): Generator<*, *, *> {
  const appState = yield select()
  const state: $IntentionalAny = providedState || appState

  const newState = pairs.reduce(
    (acc: $IntentionalAny, pair: Pair) => update(pair.path, pair.reducer, acc),
    state,
  )

  yield put({type: '@@root/SET_STATE', payload: newState})
}
