import React from 'react'
import type {PropTypeConfig_String} from '@theatre/core/propTypes'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'
import {useDerivation} from '@theatre/react'

function StringPropEditor({
  editingToolsD,
  valueD,
}: ISimplePropEditorReactProps<PropTypeConfig_String>) {
  const value = useDerivation(valueD)
  const editingTools = useDerivation(editingToolsD)
  return (
    <BasicStringInput
      value={value}
      temporarilySetValue={editingTools.temporarilySetValue}
      discardTemporaryValue={editingTools.discardTemporaryValue}
      permanentlySetValue={editingTools.permanentlySetValue}
    />
  )
}

export default StringPropEditor
