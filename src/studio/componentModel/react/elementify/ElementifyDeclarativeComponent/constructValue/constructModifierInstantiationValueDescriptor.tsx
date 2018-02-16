import constructMapDescriptor from './constructMapDescriptor'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const constructModifierInstantiationValueDescriptor = (
  desP: $FixMe,
  d: $FixMe,
) => {
  if (desP.isPointer !== true) throw Error('Pointers only')

  return dictAtom({
    modifierId: desP.prop('modifierId'),
    enabled: desP.prop('enabled'),
    props: constructMapDescriptor(desP.prop('props'), d),
  }).derivedDict()
}

export default constructModifierInstantiationValueDescriptor
