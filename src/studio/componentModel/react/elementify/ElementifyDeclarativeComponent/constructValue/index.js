// @flow
import constructModifierInstantiationValueDescriptor from './constructModifierInstantiationValueDescriptor'
import constructComponentInstantiationValueDescriptor from './constructComponentInstantiationValueDescriptor'
import type {ValueDescriptorDescribedInAnObject} from '$studio/componentModel/types'
import constructListDescriptor from './constructListDescriptor'
import constructMapDescriptor from './constructMapDescriptor'
import constructReferenceToLocalHiddenValue from './constructReferenceToLocalHiddenValue'
import constructReferenceToTimelineVar from './constructReferenceToTimelineVar'

type Constructor = (desP: $FixMe, d: $FixMe) => $FixMe

const constructors: {
  [key: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>]: Constructor,
} = {
  ComponentInstantiationValueDescriptor: constructComponentInstantiationValueDescriptor,
  ModifierInstantiationValueDescriptor: constructModifierInstantiationValueDescriptor,
  ReferenceToLocalHiddenValue: constructReferenceToLocalHiddenValue,
  ReferenceToTimelineVar: constructReferenceToTimelineVar,
}

const isLiteral = s =>
  typeof s === 'string' ||
  typeof s === 'number' ||
  typeof s === 'boolean' ||
  typeof s === 'undefined' ||
  s === null

const constructValue = (desP: $FixMe, d: $FixMe) => {
  if (desP.isPointer !== 'True') throw Error('Pointers only')

  return desP.flatMap(val => {
    if (isLiteral(val)) {
      return val
    } else if (val && val.isDerivedArray === 'True') {
      return constructListDescriptor(desP, d)
    } else if (val && val.isDerivedDict === 'True') {
      return val
        .prop('__descriptorType')
        .flatMap((type: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>) => {
          if (typeof type === 'string') {
            const constructor = constructors[type]
            if (constructor) return constructor(desP, d)
            else throw new Error(`Unkown __descriptorType '${type}'`)
          }
          return constructMapDescriptor(desP, d)
        })
    } else {
      throw new Error('Unkown value type')
    }
  })
}

export default constructValue
