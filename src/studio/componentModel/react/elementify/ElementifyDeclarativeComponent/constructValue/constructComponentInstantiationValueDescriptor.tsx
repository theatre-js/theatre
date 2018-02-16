import {elementify} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
import constructListDescriptor from './constructListDescriptor'
import boxAtom from '$src/shared/DataVerse/atoms/box'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const constructComponentInstantiationValueDescriptor = (
  des: $FixMe,
  d: $FixMe,
) => {
  // if (desP.isPointer !== true) throw Error('Pointers only')
  // const desP = des.pointer()
  // debugger

  const propsToFinalComponent = des.prop('props').flatMap((v) => constructMapDescriptor(v, d))
  const modifierInstantiationDescriptors = des.pointer().prop(
    'modifierInstantiationDescriptors',
  )

  const instantiationDescriptorP = dictAtom({
      componentId: boxAtom(des.prop('componentId')),
      props: propsToFinalComponent,
      modifierInstantiationDescriptors: dictAtom({
        byId: 
          modifierInstantiationDescriptors.prop('byId').flatMap((v) => constructMapDescriptor(v, d)),
          // d,
        // ),
        list: 
          modifierInstantiationDescriptors.prop('list').flatMap((v) => constructListDescriptor(v, d)),
          // d,
        // ),
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
