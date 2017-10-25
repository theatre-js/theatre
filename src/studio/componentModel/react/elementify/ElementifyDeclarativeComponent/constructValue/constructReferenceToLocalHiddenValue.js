
const resolveReferenceToHiddenLocalValue = (whichP, d) => { // eslint-disable-line flowtype/require-valid-file-annotation
  const componentDescriptorP = d.pointer().prop('props').prop('componentDescriptor')
  const localHiddenValuesByIdP = componentDescriptorP.prop('localHiddenValuesById')

  return whichP.flatMap((id: string) => {
    const valueDescP = localHiddenValuesByIdP.prop(id)
    return constructValue.default(valueDescP, d)
  })
}

const constructReferenceToLocalHiddenValue = (descP, d) => {
  return resolveReferenceToHiddenLocalValue(descP.prop('which'), d)
}

export default constructReferenceToLocalHiddenValue

const constructValue = require('../constructValue')