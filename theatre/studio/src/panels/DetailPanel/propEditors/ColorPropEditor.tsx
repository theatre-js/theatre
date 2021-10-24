import type {PropTypeConfig_Color} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'

const StringPropEditor: React.FC<{
  propConfig: PropTypeConfig_Color
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
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
        permenantlySetValue={stuff.permenantlySetValue}
      />
    </SingleRowPropEditor>
  )
}

export default StringPropEditor
