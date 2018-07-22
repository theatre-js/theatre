import atom, {Atom} from '$shared/DataVerse2/atom'
import {Store} from 'redux'

export default function atomFromReduxStore<State>(
  store: Store<State>,
): Atom<State> {
  let lastState = store.getState()
  const a = atom<State>(lastState)

  store.subscribe(() => {
    const newState = store.getState()
    a.setState(newState)
    lastState = newState
  })

  return a
}
