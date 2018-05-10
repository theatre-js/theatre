import {diff} from 'jiff'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'
import atomifyDeep, {Atomify} from '$shared/DataVerse/atoms/atomifyDeep'
import {ITheaterStoreState} from '$theater/types'
import {extractState} from '$shared/utils/redux/withHistory/withHistory'
import {Store} from 'redux'

export default function configureAtom(store: Store<ITheaterStoreState>) {
  let lastState = extractState(store.getState())
  const atom: Atomify<ITheaterStoreState> = atomifyDeep(
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
