import constructMapDescriptor from './constructMapDescriptor'
import dictAtom from '$shared//DataVerse/atoms/dictAtom'

const constructModifierInstantiationValueDescriptor = (
  des: $FixMe,
  self: $FixMe,
) => {
  return dictAtom({
    modifierId: des.prop('modifierId'),
    enabled: des.prop('enabled'),
    props: des.prop('props').flatMap(v => constructMapDescriptor(v, self)),
  }).derivedDict()
}

export default constructModifierInstantiationValueDescriptor
