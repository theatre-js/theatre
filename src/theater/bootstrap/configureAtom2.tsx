import StoreAndStuff from '$src/lb/bootstrap/StoreAndStuff'
import {ITheaterStoreState} from '$theater/types'
import atom, {Atom} from '$shared/DataVerse2/atom'

export default function configureAtom(
  storeAndStuff: StoreAndStuff<ITheaterStoreState, $IntentionalAny>,
): Atom<ITheaterStoreState> {
  let lastState = storeAndStuff.reduxStore.getState()
  const a = atom(lastState)

  storeAndStuff.reduxStore.subscribe(() => {
    const newState = storeAndStuff.reduxStore.getState()
    a.setState(newState)
    lastState = newState
  })

  return a
}
