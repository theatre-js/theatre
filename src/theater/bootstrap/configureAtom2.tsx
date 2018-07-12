import atom, {Atom} from '$shared/DataVerse2/atom'
import {Store} from 'redux'

export default function configureAtom<T>(
  store: Store<T>,
): Atom<T> {
  let lastState = store.getState()
  const a = atom<T>(lastState)

  store.subscribe(() => {
    const newState = store.getState()
    a.setState(newState)
    lastState = newState
  })

  return a
}
