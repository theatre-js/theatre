import constructModifierInstantiationValueDescriptor from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructModifierInstantiationValueDescriptor'
import constructComponentInstantiationValueDescriptor from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructComponentInstantiationValueDescriptor'
import {ValueDescriptorDescribedInAnObject} from '$src/studio/componentModel/types'
import constructListDescriptor from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructListDescriptor'
import constructMapDescriptor from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructMapDescriptor'
import constructReferenceToLocalHiddenValue from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructReferenceToLocalHiddenValue'
import constructReferenceToTimelineVar from '$src/studio/componentModel/react/elementify/ElementifyDeclarativeComponent/constructValue/constructReferenceToTimelineVar'

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

const constructValue = (desP: $FixMe, self: $FixMe) => {
  if (desP.isPointer !== true) throw Error('Pointers only')

  return desP.flatMap(val => {
    if (isLiteral(val)) {
      return val
    } else if (val && val.isDerivedArray === true) {
      return constructListDescriptor(desP, self)
    } else if (val && val.isDerivedDict === true) {
      return val
        .prop('__descriptorType')
        .flatMap((type: ValueDescriptorDescribedInAnObject['type']) => {
          if (typeof type === 'string') {
            const constructor = constructors[type]
            if (constructor) return constructor(desP, self)
            else throw new Error(`Unkown __descriptorType '${type}'`)
          }
          return constructMapDescriptor(desP, self)
        })
    } else {
      throw new Error('Unkown value type')
    }
  })
}

export default constructValue
