import StoreAndStuff from '$src/lb/bootstrap/StoreAndStuff'
import {IStudioStoreState} from '$src/studio/types'
import atom, {Atom} from '$shared/DataVerse2/atom'

export default function configureAtom(
  storeAndStuff: StoreAndStuff<IStudioStoreState, $IntentionalAny>,
): Atom<IStudioStoreState> {
  let lastState = storeAndStuff.reduxStore.getState()
  const a = atom(lastState)

  storeAndStuff.reduxStore.subscribe(() => {
    const newState = storeAndStuff.reduxStore.getState()
    a.setState(newState)
    lastState = newState
  })

  return a
}
