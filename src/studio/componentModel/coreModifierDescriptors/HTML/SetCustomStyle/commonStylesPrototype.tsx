import reifiedStyleApplier from './reifiedStyleApplier'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import emptyDict from '$src/shared/DataVerse/derivations/dicts/emptyDict'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const ensureReifiedStyles = d => {
  return d.propFromSuper('reifiedStyles').flatMap(possibleReifiedStyles => {
    if (!possibleReifiedStyles) {
      return emptyDict
    } else {
      return possibleReifiedStyles
    }
  })
}

const sideEffectsForApplyReifiedStyles = dictAtom({
  applyReifiedStyles: boxAtom((dict, ticker) => {
    const applier = reifiedStyleApplier(dict, ticker)
    applier.start()

    return () => {
      applier.stop()
    }
  }),
}).derivedDict()

export default {
  reifiedStyles(self: $FixMe) {
    return ensureReifiedStyles(self)
  },
  sideEffects(self: $FixMe) {
    return self
      .propFromSuper('sideEffects')
      .flatMap((sideEffects: AbstractDerivedDict<$FixMe>) => {
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
