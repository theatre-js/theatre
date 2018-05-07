import {diff} from 'jiff'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'
import atomifyDeep, {Atomify} from '$shared/DataVerse/atoms/atomifyDeep'
import StoreAndStuff from '$src/lb/bootstrap/StoreAndStuff'
import {ITheaterStoreState} from '$theater/types'
import {extractState} from '$shared/utils/redux/withHistory/withHistory'

export default function configureAtom(
  reduxStore: StoreAndStuff<ITheaterStoreState, $IntentionalAny>,
) {
  let lastState = extractState(reduxStore.reduxStore.getState())
  const atom: Atomify<ITheaterStoreState> = atomifyDeep(lastState) as $IntentionalAny

  reduxStore.reduxStore.subscribe(() => {
    const newState = extractState(reduxStore.reduxStore.getState())
    const diffs: Array<Object> = diff(lastState, newState, {invertible: false})
    for (const d of diffs) {
      applyJsonDiffToAtom(d, atom)
    }

    lastState = newState
  })

  return atom
}
