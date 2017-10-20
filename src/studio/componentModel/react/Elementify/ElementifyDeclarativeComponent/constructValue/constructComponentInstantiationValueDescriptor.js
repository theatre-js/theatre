// @flow
import {D, elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import constructListDescriptor from './constructListDescriptor'

const constructComponentInstantiationValueDescriptor = (des: $FixMe, d: $FixMe) => {
  const propsToFinalComponent = constructMapDescriptor(des.pointer().prop('props'), d)
  const modifierInstantiationDescriptors = des.pointer().prop('modifierInstantiationDescriptors')

  const instantiationDescriptorP = D.atoms.dict({
    componentId: D.atoms.box(des.pointer().prop('componentId')),
    props: propsToFinalComponent,
    modifierInstantiationDescriptors: D.atoms.dict({
      byId: constructMapDescriptor(modifierInstantiationDescriptors.prop('byId'), d),
      list: constructListDescriptor(modifierInstantiationDescriptors.prop('list'), d),
    }),
  }).derivedDict().pointer()

  return elementify(instantiationDescriptorP.prop('props').prop('key'), instantiationDescriptorP, d.pointer().prop('studio'))
}

export default constructComponentInstantiationValueDescriptor