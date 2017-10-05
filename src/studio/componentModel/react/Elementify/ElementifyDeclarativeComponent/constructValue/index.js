
import constructComponentInstantiationValueDescriptor from './constructComponentInstantiationValueDescriptor'
import type {ValueDescriptorDescribedInAnObject} from '$studio/componentModel/types'

type Constructor = (des: $FixMe, d: $FixMe) => $FixMe

const constructors: {[key: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>]: Constructor} = {
  ComponentInstantiationValueDescriptor: constructComponentInstantiationValueDescriptor,
}

const isLiteral = (s) =>
  typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean' || typeof s === 'undefined' || s === null

const constructValue = (des, d) => {
  return des.flatMap((val) => {
    if (isLiteral(val)) {
      return val
    } else {
      return des.prop('type').flatMap((type: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>) => {
        const constructor = constructors[type]
        if (constructor)
          return constructor(des, d)
        else
          throw new Error(`Value constructor type ${type} is unsupported`)
      })
    }
  })
}

export default constructValue