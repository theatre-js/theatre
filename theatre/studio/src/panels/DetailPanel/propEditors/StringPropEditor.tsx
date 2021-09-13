import type {PropTypeConfig_String} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import BasicStringInput from '@theatre/studio/uiComponents/form/BasicStringInput'

const StringPropEditor: React.FC<{
  propConfig: PropTypeConfig_String
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<string>(
    pointerToProp,
    obj,
    propConfig,
  )

  const onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      stuff.permenantlySetValue(String(el.target.value))
    },
    [propConfig, pointerToProp, obj],
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <BasicStringInput value={stuff.value} onChange={onChange} />
    </SingleRowPropEditor>
  )
}

export default StringPropEditor
