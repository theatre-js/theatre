// @flow
import constructModifierInstantiationValueDescriptor from './constructModifierInstantiationValueDescriptor'
import constructComponentInstantiationValueDescriptor from './constructComponentInstantiationValueDescriptor'
import type {ValueDescriptorDescribedInAnObject} from '$studio/componentModel/types'
import constructListDescriptor from './constructListDescriptor'

type Constructor = (desP: $FixMe, d: $FixMe) => $FixMe

const constructors: {[key: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>]: Constructor} = {
  ComponentInstantiationValueDescriptor: constructComponentInstantiationValueDescriptor,
  ModifierInstantiationValueDescriptor: constructModifierInstantiationValueDescriptor,
}

const isLiteral = (s) =>
  typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean' || typeof s === 'undefined' || s === null

const constructValue = (desP: $FixMe, d: $FixMe) => {
  if (desP.isPointer !== 'True')
    throw Error('Pointers only')

  return desP.flatMap((val) => {
    if (isLiteral(val)) {
      return val
    } else if (val && val.isDerivedArray === 'True') {
      return constructListDescriptor(desP, d)
    } else {
      return val.prop('type').flatMap((type: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>) => {
        const constructor = constructors[type]
        if (constructor)
          return constructor(desP, d)
        else
          throw new Error(`Value constructor type ${type} is unsupported`)
      })
    }
  })
}

export default constructValue