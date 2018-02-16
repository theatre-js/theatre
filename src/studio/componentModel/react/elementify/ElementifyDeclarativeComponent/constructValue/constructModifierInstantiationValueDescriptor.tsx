import constructMapDescriptor from './constructMapDescriptor'
import dictAtom from '$src/shared/DataVerse/atoms/dict'

const constructModifierInstantiationValueDescriptor = (
  des: $FixMe,
  d: $FixMe,
) => {
  // if (desP.isPointer !== true) throw Error('Pointers only')
  const desP = des

  return dictAtom({
    modifierId: desP.prop('modifierId'),
    enabled: desP.prop('enabled'),
    props: constructMapDescriptor(desP.prop('props'), d),
  }).derivedDict()
}

export default constructModifierInstantiationValueDescriptor
