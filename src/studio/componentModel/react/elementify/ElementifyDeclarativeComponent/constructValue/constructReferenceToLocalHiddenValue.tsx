const resolveReferenceToHiddenLocalValue = (whichP, d) => {
  const componentDescriptorP = d
    .pointer()
    .prop('props')
    .prop('componentDescriptor')
  const localHiddenValuesByIdP = componentDescriptorP.prop(
    'localHiddenValuesById',
  )

  return whichP.flatMap((id: string) => {
    const valueDescP = localHiddenValuesByIdP.prop(id)
    return valueDescP.flatMap(v => constructValue.default(v, d))
  })
}

const constructReferenceToLocalHiddenValue = (des, d) => {
  const descP = des.pointer()
  return resolveReferenceToHiddenLocalValue(descP.prop('which'), d)
}

export default constructReferenceToLocalHiddenValue

const constructValue = require('./constructValue')
