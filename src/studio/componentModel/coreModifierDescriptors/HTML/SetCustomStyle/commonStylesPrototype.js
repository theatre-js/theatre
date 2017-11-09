// @flow
import * as D from '$shared/DataVerse'

import ReifiedStyleApplier from './ReifiedStyleApplier'

const ensureReifiedStyles = d => {
  return d.propFromAbove('reifiedStyles').flatMap(possibleReifiedStyles => {
    if (!possibleReifiedStyles) {
      return D.derivations.emptyDict
    } else {
      return possibleReifiedStyles
    }
  })
}

const sideEffectsForApplyReifiedStyles = D.atoms
  .dict({
    applyReifiedStyles: D.atoms.box((dict, ticker) => {
      const applier = new ReifiedStyleApplier(dict, ticker)
      applier.start()

      return () => {
        applier.stop()
      }
    }),
  })
  .derivedDict()

export default {
  reifiedStyles(d: $FixMe) {
    return ensureReifiedStyles(d)
  },
  sideEffects(d: $FixMe) {
    return d
      .propFromAbove('sideEffects')
      .flatMap((sideEffects: D.IDerivedDict<$FixMe>) => {
        return sideEffects
          .pointer()
          .prop('applyReifiedStyles')
          .map(applyReifiedStyles => {
            if (applyReifiedStyles) {
              return sideEffects
            } else {
              return sideEffects.extend(sideEffectsForApplyReifiedStyles)
            }
          })
      })
  },
}
