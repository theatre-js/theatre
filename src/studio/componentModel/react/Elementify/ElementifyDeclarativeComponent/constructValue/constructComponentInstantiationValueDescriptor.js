// @flow
import {D, Elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import * as React from 'react'

const constructComponentInstantiationValueDescriptor = (des: $FixMe, d: $FixMe) => {
  const propsToFinalComponent = constructMapDescriptor(des.pointer().prop('props'), d)
  // console.log('---', des.pointer().prop('props').getValue(), des.pointer().prop('modifierInstantiationDescriptorsByID').getValue())
  const modifierInstantiationDescriptorsByID = constructMapDescriptor(des.pointer().prop('modifierInstantiationDescriptorsByID'), d)
  // console.log(modifierInstantiationDescriptorsByID, 'bb')

  const propsToElementifyP = D.atoms.dict({
    instantiationDescriptor:D.atoms.dict({
      componentID: D.atoms.box(des.pointer().prop('componentID')),
      props: propsToFinalComponent,
      modifierInstantiationDescriptorsByID,
    }),
  }).derivedDict().pointer()

  return propsToElementifyP.prop('key').map((key) => {
    return <Elementify key={key} props={propsToElementifyP} /> // dragon 1: make it just elementify
  })
}

export default constructComponentInstantiationValueDescriptor