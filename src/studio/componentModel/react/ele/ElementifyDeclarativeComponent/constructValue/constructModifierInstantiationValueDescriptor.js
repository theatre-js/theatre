// @flow
import {D} from '$studio/handy'
import constructMapDescriptor from './constructMapDescriptor'
// import constructListDescriptor from './constructListDescriptor'

const constructModifierInstantiationValueDescriptor = (desP: $FixMe, d: $FixMe) => {
  if (desP.isPointer !== 'True')
    throw Error('Pointers only')

  return D.atoms.dict({
    modifierId: desP.prop('modifierId'),
    enabled: desP.prop('enabled'),
    props: constructMapDescriptor(desP.prop('props'), d),
  }).derivedDict()
}

export default constructModifierInstantiationValueDescriptor