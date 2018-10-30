import {diff} from 'jiff'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'
import atomifyDeep, {Atomify} from '$shared/DataVerse/atoms/atomifyDeep'
import {ITheatreStoreState} from '$studio/types'
import {extractState} from '$shared/utils/redux/withHistory/withHistoryDeprecated'
import {Store} from 'redux'

export default function configureAtom(store: Store<ITheatreStoreState>) {
  let lastState = extractState(store.getState())
  const atom: Atomify<ITheatreStoreState> = atomifyDeep(
    lastState,
  ) as $IntentionalAny

  store.subscribe(() => {
    const newState = extractState(store.getState())
    const diffs: Array<Object> = diff(lastState, newState, {invertible: false})
    for (const d of diffs) {
      applyJsonDiffToAtom(d, atom)
    }

    lastState = newState
  })

  return atom
}
