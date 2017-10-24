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
  applyAttributes: D.atoms.box((dict, dvContext) => {
    const applier = new AttributesApplier(dict, dvContext)
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
        return propsP.prop('attributeName').flatMap((attributeName: string) => {
          return domAtrributes.extend(D.atoms.dict({[attributeName]: propsP.prop('value')}).derivedDict())
        })
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
}

export default descriptor