// @flow
import constructComponentInstantiationValueDescriptor from './constructComponentInstantiationValueDescriptor'
import type {ValueDescriptorDescribedInAnObject} from '$studio/componentModel/types'

type Constructor = (des: $FixMe, d: $FixMe) => $FixMe

const constructors: {[key: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>]: Constructor} = {
  ComponentInstantiationValueDescriptor: constructComponentInstantiationValueDescriptor,
}

const isLiteral = (s) =>
  typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean' || typeof s === 'undefined' || s === null

const constructValue = (des: $FixMe, d: $FixMe) => {
  return des.flatMap((val) => {
    if (isLiteral(val)) {
      return val
    } else if (val && val.isDerivedArray === 'True') {
      return val.map((v) => constructValue(v, d))
    } else {
      return val.prop('type').flatMap((type: $ElementType<ValueDescriptorDescribedInAnObject, 'type'>) => {
        const constructor = constructors[type]
        if (constructor)
          return constructor(val, d)
        else
          throw new Error(`Value constructor type ${type} is unsupported`)
      })
    }
  })
}

export default constructValue