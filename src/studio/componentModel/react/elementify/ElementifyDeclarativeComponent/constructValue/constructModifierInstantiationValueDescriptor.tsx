import constructMapDescriptor from './constructMapDescriptor'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const constructModifierInstantiationValueDescriptor = (
  des: $FixMe,
  d: $FixMe,
) => {
  return dictAtom({
    modifierId: des.prop('modifierId'),
    enabled: des.prop('enabled'),
    props: des.prop('props').flatMap((v) => constructMapDescriptor(v, d)),
  }).derivedDict()
}

export default constructModifierInstantiationValueDescriptor
