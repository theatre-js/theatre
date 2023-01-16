import {Atom} from '@theatre/dataverse'
import type {Store} from 'redux'

export default function atomFromReduxStore<State>(
  store: Store<State>,
): Atom<State> {
  let lastState = store.getState()
  const a = new Atom<State>(lastState)

  store.subscribe(() => {
    const newState = store.getState()
    a.set(newState)
    lastState = newState
  })

  return a
}
