import {ITheaterStoreState} from '$theater/types'
import atom, {Atom} from '$shared/DataVerse2/atom'
import {Store} from 'redux'

export default function configureAtom(
  store: Store<ITheaterStoreState>,
): Atom<ITheaterStoreState> {
  let lastState = store.getState()
  const a = atom(lastState)

  store.subscribe(() => {
    const newState = store.getState()
    a.setState(newState)
    lastState = newState
  })

  return a
}
