import React from 'react'
import type {PropTypeConfig_String} from '@theatre/core/propTypes'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type {ISimplePropEditorVFC} from './utils/IPropEditorFC'

const StringPropEditor: ISimplePropEditorVFC<PropTypeConfig_String> = ({
  editingTools,
  value,
}) => {
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
