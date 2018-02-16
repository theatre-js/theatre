import {elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import constructListDescriptor from './constructListDescriptor'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const constructComponentInstantiationValueDescriptor = (
  desP: $FixMe,
  d: $FixMe,
) => {
  if (desP.isPointer !== true) throw Error('Pointers only')

  const propsToFinalComponent = constructMapDescriptor(desP.prop('props'), d)
  const modifierInstantiationDescriptors = desP.prop(
    'modifierInstantiationDescriptors',
  )

  const instantiationDescriptorP = dictAtom({
      componentId: boxAtom(desP.prop('componentId')),
      props: propsToFinalComponent,
      modifierInstantiationDescriptors: dictAtom({
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
