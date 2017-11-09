// @flow
import {type ModifierDescriptor} from '$studio/componentModel/types'
import AttributesApplier from './AttributesApplier'
import * as D from '$shared/DataVerse'

const ensureDomAttributes = (d) => {
  return d.propFromAbove('domAttributes').flatMap((possibleDomAttributes) => {
    if (!possibleDomAttributes) {
      return D.derivations.emptyDict
    } else {
      return possibleDomAttributes
    }
  })
}

const sideEffectsForApplyAttributes = D.atoms.dict({
  applyAttributes: D.atoms.box((dict, ticker) => {
    const applier = new AttributesApplier(dict, ticker)
    applier.start()

    return () => {
      applier.stop()
    }
  }),
}).derivedDict()

const modifyPrototypalDict = (propsP, dict) => {
  return dict.extend({
    domAttributes(d) {
      return ensureDomAttributes(d).flatMap((domAtrributes) => {
        const ret = propsP.prop('pairings').prop('list').flatMap((list) => {
          return list.reduce((accDict, pairingId) => {
            const pairingP = propsP.prop('pairings').prop('byId').prop(pairingId)
            const keyP = pairingP.prop('key')
            const valueP = pairingP.prop('value')
            return keyP.flatMap((key: string) => {
              return accDict.extend(D.atoms.dict({[key]: valueP}).derivedDict())
            })
          }, domAtrributes)
        })

        return ret
      })
    },
    sideEffects(d) {
      return d.propFromAbove('sideEffects').flatMap((sideEffects: D.IDerivedDict<$FixMe>) => {
        return sideEffects.pointer().prop('applyAttributes').map((applyAttributes) => {
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
  modifyPrototypalDict,
  InspectorComponent: require('./SetAttributeInspector').default,
}

export default descriptor