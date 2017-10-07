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

const dictModifier = (instantiationDescriptorP, dict) => {
  return dict.extend({
    domAttributes(a) {
      return ensureDomAttributes(a).flatMap((domAtrributes) => {
        return instantiationDescriptorP.prop('props').prop('name').flatMap((name: string) => {
          return domAtrributes.extend({[name]: instantiationDescriptorP.prop('props').prop('value')})
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