import constructValue from './constructValue'  // eslint-disable-line flowtype/require-valid-file-annotation

const resolveReferenceToHiddenLocalValue = (whichP, d) => {
  const componentDescriptorP = d.pointer().prop('props').prop('componentDescriptor')
  const localHiddenValuesByIdP = componentDescriptorP.prop('localHiddenValuesById')

  return whichP.map((id: string) => localHiddenValuesByIdP.prop(id)).flattenDeep().flatMap((valueDescriptor) => {
    if (!valueDescriptor) return
    return constructValue(valueDescriptor.pointer(), d)
  })
}

export default resolveReferenceToHiddenLocalValue