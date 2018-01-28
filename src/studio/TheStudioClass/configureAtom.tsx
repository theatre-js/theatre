// @flow
import jsonPatchLib from 'fast-json-patch'
import * as D from '$shared/DataVerse'
import * as _ from 'lodash'
import applyJsonDiffToAtom from '$shared/utils/applyJsonDiffToAtom'

export default function configureAtom(reduxStore: $FixMe) {
  let lastState = reduxStore.reduxStore.getState()
  const atom = D.atoms.atomifyDeep(lastState)

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
