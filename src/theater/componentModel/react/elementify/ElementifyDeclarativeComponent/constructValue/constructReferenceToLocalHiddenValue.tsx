const resolveReferenceToHiddenLocalValue = (whichP, self) => {
  const componentDescriptorP = self.pointer().prop('componentDescriptor')
  const localHiddenValuesByIdP = componentDescriptorP.prop(
    'localHiddenValuesById',
  )

  return whichP.flatMap((id: string) => {
    const valueDescP = localHiddenValuesByIdP.prop(id)
    return valueDescP.flatMap(v => constructValue.default(v, self))
  })
}

const constructReferenceToLocalHiddenValue = (des, self) => {
  const descP = des.pointer()
  return resolveReferenceToHiddenLocalValue(descP.prop('which'), self)
}

export default constructReferenceToLocalHiddenValue

const constructValue = require('./constructValue')