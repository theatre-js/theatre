// @flow
import {D, Elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
// import constructListDescriptor from './constructListDescriptor'
import * as React from 'react'

const constructComponentInstantiationValueDescriptor = (des: $FixMe, d: $FixMe) => {
  const propsToFinalComponent = constructMapDescriptor(des.pointer().prop('props'), d)
  const modifierInstantiationDescriptors = des.pointer().prop('modifierInstantiationDescriptors')

  const propsToElementifyP = D.atoms.dict({
    instantiationDescriptor:D.atoms.dict({
      componentId: D.atoms.box(des.pointer().prop('componentId')),
      props: propsToFinalComponent,
      modifierInstantiationDescriptors: D.atoms.dict({
        byId: constructMapDescriptor(modifierInstantiationDescriptors.prop('byId'), d),
        // list: constructListDescriptor(modifierInstantiationDescriptors.prop('byId'), d)
      }),
    }),
  }).derivedDict().pointer()

  return propsToElementifyP.prop('key').map((key) => {
    return <Elementify key={key} props={propsToElementifyP} /> // dragon 1: make it just elementify
  })
}

export default constructComponentInstantiationValueDescriptor