import React from 'react'
import type {PropTypeConfig_String} from '@theatre/core/propTypes'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

function StringPropEditor({
  editingTools,
  value,
}: ISimplePropEditorReactProps<PropTypeConfig_String>) {
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
