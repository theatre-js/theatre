// @flow
import * as D from '$shared/DataVerse'

import reifiedStyleApplier from './reifiedStyleApplier'

const ensureReifiedStyles = d => {
  return d.propFromSuper('reifiedStyles').flatMap(possibleReifiedStyles => {
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
      const applier = reifiedStyleApplier(dict, ticker)
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
      .propFromSuper('sideEffects')
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
