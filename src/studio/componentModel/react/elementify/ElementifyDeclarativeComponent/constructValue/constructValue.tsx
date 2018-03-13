import constructModifierInstantiationValueDescriptor from './constructModifierInstantiationValueDescriptor'
import constructComponentInstantiationValueDescriptor from './constructComponentInstantiationValueDescriptor'
import {ValueDescriptorDescribedInAnObject} from '$src/studio/componentModel/types'
import constructListDescriptor from './constructListDescriptor'
import constructMapDescriptor from './constructMapDescriptor'
import constructReferenceToLocalHiddenValue from './constructReferenceToLocalHiddenValue'
import constructReferenceToTimelineVar from './constructReferenceToTimelineVar'

type Constructor = (desP: $FixMe, d: $FixMe) => $FixMe

const constructors: {
  [key: ValueDescriptorDescribedInAnObject['type']]: Constructor
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

const constructValue = (val: $FixMe, self: $FixMe) => {
  // if (desP.isPointer !== true) {
  // debugger
  // throw Error('Pointers only')
  // }
  // debugger

  // return desP.flatMap(val => {
  if (isLiteral(val)) {
    return val
  } else if (val && val.isDerivedArray === true) {
    return constructListDescriptor(val, self)
  } else if (val && val.isDerivedDict === true) {
    return val
      .prop('__descriptorType')
      .flatMap((type: ValueDescriptorDescribedInAnObject['type']) => {
        if (typeof type === 'string') {
          const constructor = constructors[type]
          if (constructor) return constructor(val, self)
          else throw new Error(`Unkown __descriptorType '${type}'`)
        }
        return constructMapDescriptor(val, self)
      })
  } else {
    throw new Error('Unkown value type')
  }
  // })
}

export default constructValue
