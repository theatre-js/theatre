import jsonPatchLib from 'fast-json-patch'
import * as _ from 'lodash'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'
import atomifyDeep from '$src/shared/DataVerse/atoms/atomifyDeep'
import StandardStore from '$src/lb/bootstrap/StandardStore'
import {Store} from 'redux'
import {IStoreState} from '$src/studio/types'
import {extractState} from '$src/shared/utils/redux/historyReducer/wrapReducerWithHistory'

export default function configureAtom(
  reduxStore: StandardStore<Store<IStoreState>, $IntentionalAny>,
) {
  let lastState = extractState(reduxStore.reduxStore.getState())
  const atom = atomifyDeep(lastState)

  reduxStore.reduxStore.subscribe(() => {
    const newState = extractState(reduxStore.reduxStore.getState())
    const diffs: Array<Object> = jsonPatchLib.compare(lastState, newState)
    for (let diff of diffs) {
      applyJsonDiffToAtom(diff, atom)
    }

    lastState = newState
  })

  return atom
}
