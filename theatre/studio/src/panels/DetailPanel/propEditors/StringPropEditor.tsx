import React from 'react'
import type {PropTypeConfig_String} from '@theatre/core/propTypes'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'
import type {IPropEditorFC} from './utils/IPropEditorFC'

const StringPropEditor: IPropEditorFC<PropTypeConfig_String> = ({
  propConfig,
  pointerToProp,
  obj,
}) => {
  const stuff = useEditingToolsForPrimitiveProp<string>(
    pointerToProp,
    obj,
    propConfig,
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <BasicStringInput
        value={stuff.value}
        temporarilySetValue={stuff.temporarilySetValue}
        discardTemporaryValue={stuff.discardTemporaryValue}
        permanentlySetValue={stuff.permanentlySetValue}
      />
    </SingleRowPropEditor>
  )
}

export default StringPropEditor
