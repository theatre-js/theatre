import attributesApplier from '$src/studio/componentModel/coreModifierDescriptors/HTML/SetAttribute/attributeApplier'
import boxAtom from '$shared/DataVerse/atoms/boxAtom'
import emptyDict from '$shared/DataVerse/derivations/dicts/emptyDict'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import AbstractDerivedDict from '$shared/DataVerse/derivations/dicts/AbstractDerivedDict'

const ensureDomAttributes = d => {
  return d.propFromSuper('domAttributes').flatMap(possibleDomAttributes => {
    if (!possibleDomAttributes) {
      return emptyDict
    } else {
      return possibleDomAttributes
    }
  })
}

const sideEffectsForApplyAttributes = dictAtom({
  applyAttributes: boxAtom((dict, ticker) => {
    const applier = attributesApplier(dict, ticker)
    applier.start()

    return () => {
      applier.stop()
    }
  }),
}).derivedDict()

const getClass = (propsP, dict) => {
  return dict.extend({
    domAttributes(d) {
      return ensureDomAttributes(d).flatMap(domAtrributes => {
        const ret = propsP
          .prop('pairings')
          .prop('list')
          .flatMap(list => {
            return list.reduce((accDict, pairingId) => {
              const pairingP = propsP
                .prop('pairings')
                .prop('byId')
                .prop(pairingId)
              const keyP = pairingP.prop('key')
              const valueP = pairingP.prop('value')
              return keyP.flatMap((key: string) => {
                return accDict.extend(dict({[key]: valueP}).derivedDict())
              })
            }, domAtrributes)
          })

        return ret
      })
    },
    sideEffects(d) {
      return d
        .propFromSuper('sideEffects')
        .flatMap((sideEffects: AbstractDerivedDict<$FixMe>) => {
          return sideEffects
            .pointer()
            .prop('applyAttributes')
            .map(applyAttributes => {
              if (applyAttributes) {
                return sideEffects
              } else {
                return sideEffects.extend(sideEffectsForApplyAttributes)
              }
            })
        })
    },
  })
}

const descriptor: ModifierDescriptor = {
  id: 'TheaterJS/Core/HTML/SetAttribute',
  getClass,
}

export default descriptor
