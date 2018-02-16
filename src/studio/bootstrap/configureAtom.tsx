import jsonPatchLib from 'fast-json-patch'
import * as _ from 'lodash'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'
import atomifyDeep from '$src/shared/DataVerse/atoms/atomifyDeep';

export default function configureAtom(reduxStore: $FixMe) {
  let lastState = _.cloneDeep(reduxStore.reduxStore.getState())
  const atom = atomifyDeep(lastState)

  reduxStore.reduxStore.subscribe(() => {
    const newState = reduxStore.reduxStore.getState()
    const diffs: Array<Object> = jsonPatchLib.compare(lastState, newState)
    for (let diff of diffs) {
      applyJsonDiffToAtom(diff, atom)
    }

    lastState = _.cloneDeep(newState)
  })

  return atom
}
