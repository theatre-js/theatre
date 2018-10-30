import constructMapDescriptor from './constructMapDescriptor'
import constructListDescriptor from './constructListDescriptor'
import boxAtom from '$shared/DataVerse/atoms/boxAtom'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'
import elementify from '$theater/componentModel/react/elementify/elementify'

const constructComponentInstantiationValueDescriptor = (
  des: $FixMe,
  self: $FixMe,
) => {
  const propsToFinalComponent = des.prop('props').flatMap(v => {
    return constructMapDescriptor(v, self)
  })

  const modifierInstantiationDescriptors = des
    .pointer()
    .prop('modifierInstantiationDescriptors')

  const instantiationDescriptorP = dictAtom({
    componentId: boxAtom(des.prop('componentId')),
    props: propsToFinalComponent,
    modifierInstantiationDescriptors: dictAtom({
      byId: modifierInstantiationDescriptors
        .prop('byId')
        .flatMap(v => constructMapDescriptor(v, self)),
      list: modifierInstantiationDescriptors
        .prop('list')
        .flatMap(v => constructListDescriptor(v, self)),
    }),
    owner: self.prop('componentInstance'),
  })
    .derivedDict()
    .pointer()

  return elementify(
    instantiationDescriptorP.prop('props').prop('key'),
    instantiationDescriptorP,
    self.pointer().prop('theater'),
  )
}

export default constructComponentInstantiationValueDescriptor
