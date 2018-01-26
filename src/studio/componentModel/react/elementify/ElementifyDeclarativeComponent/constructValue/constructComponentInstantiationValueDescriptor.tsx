// @flow
import {D, elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import constructListDescriptor from './constructListDescriptor'

const constructComponentInstantiationValueDescriptor = (
  desP: $FixMe,
  d: $FixMe,
) => {
  if (desP.isPointer !== true) throw Error('Pointers only')

  const propsToFinalComponent = constructMapDescriptor(desP.prop('props'), d)
  const modifierInstantiationDescriptors = desP.prop(
    'modifierInstantiationDescriptors',
  )

  const instantiationDescriptorP = D.atoms
    .dict({
      componentId: D.atoms.box(desP.prop('componentId')),
      props: propsToFinalComponent,
      modifierInstantiationDescriptors: D.atoms.dict({
        byId: constructMapDescriptor(
          modifierInstantiationDescriptors.prop('byId'),
          d,
        ),
        list: constructListDescriptor(
          modifierInstantiationDescriptors.prop('list'),
          d,
        ),
      }),
    })
    .derivedDict()
    .pointer()

  return elementify(
    instantiationDescriptorP.prop('props').prop('key'),
    instantiationDescriptorP,
    d.pointer().prop('studio'),
  )
}

export default constructComponentInstantiationValueDescriptor
