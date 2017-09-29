
import {D, Elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import * as React from 'react'

const constructComponentInstantiationValueDescriptor = (des, d) => {
  const propsToFinalComponent = constructMapDescriptor(des.pointer().prop('props'), d) // dragon 2: implement this
  const propsToElementifyP = (new D.MapAtom({
    instantiationDescriptor: new D.MapAtom({
      componentID: new D.BoxAtom(des.pointer().prop('componentID')),
      props: propsToFinalComponent,
    }),
  })).pointer()

  return propsToElementifyP.prop('key').map((key) => {
    return <Elementify key={key} props={propsToElementifyP} /> // dragon 1: make it just elementify
  })
}

export default constructComponentInstantiationValueDescriptor