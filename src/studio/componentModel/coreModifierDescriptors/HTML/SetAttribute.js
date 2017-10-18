// @flow
import {type ComponentDescriptor} from '$studio/componentModel/types'
import {makeReactiveComponent} from '$studio/handy'
import * as React from 'react'
import * as D from '$shared/DataVerse'

type Props = {
  name: string,
  value: string,
}

const ensureDomAttributes = (a) => {
  return a.propFromAbove('domAttributes').flatMap((possibleDomAttributes) => {
    if (!possibleDomAttributes) {
      return D.derivations.emptyDict
    } else {
      return possibleDomAttributes
    }
  })
}

const sideEffectsForApplyAttributes = {
  applyAttributes(dict) {
    console.log('started applying attributes')
    const stop = () => {
      console.log('stopped applying attributes')
    }

    return stop
  },
}

const dictModifier = (instantiationDescriptorP, dict) => {
  return dict.extend({
    domAttributes(d) {
      return ensureDomAttributes(d).flatMap((domAtrributes) => {
        return instantiationDescriptorP.prop('props').prop('name').flatMap((name: string) => {
          return domAtrributes.extend({[name]: instantiationDescriptorP.prop('props').prop('value')})
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

// $FixMe
const descriptor: ComponentDescriptor = {
  id: 'TheaterJS/Core/HTML/SetAttribute',
  dictModifier,
}

export default descriptor