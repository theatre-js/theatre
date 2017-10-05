// @flow
import {D, Elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import * as React from 'react'

const constructComponentInstantiationValueDescriptor = (des: D.IPointer<$FixMe>, d: $FixMe) => {
  const propsToFinalComponent = constructMapDescriptor(des.pointer().prop('props'), d) // dragon 2: implement this
  const propsToElementifyP = D.atoms.dict({
    instantiationDescriptor:D.atoms.dict({
      componentID: D.atoms.box(des.pointer().prop('componentID')),
      props: propsToFinalComponent,
    }),
  }).derivedDict().pointer()

  return propsToElementifyP.prop('key').map((key) => {
    return <Elementify key={key} props={propsToElementifyP} /> // dragon 1: make it just elementify
  })
}

export default constructComponentInstantiationValueDescriptor