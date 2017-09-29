
import {D} from '$studio/handy'
import * as React from 'react'
import constructValue from './constructValue'

const resolveReferenceToHiddenLocalValue = (whichP, d) => {
  const componentDescriptorP = d.pointer().prop('props').prop('componentDescriptor')
  const localHiddenValuesByIDP = componentDescriptorP.prop('localHiddenValuesByID')

  return whichP.map((id: string) => localHiddenValuesByIDP.prop(id)).flattenDeep().flatMap((valueDescriptor) => {
    if (!valueDescriptor) return
    return constructValue(valueDescriptor.pointer(), d)
  })
}

export default resolveReferenceToHiddenLocalValue