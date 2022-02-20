import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicSwitch from '@theatre/studio/uiComponents/form/BasicSwitch'
import BasicSelect from '@theatre/studio/uiComponents/form/BasicSelect'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'

const StringLiteralPropEditor: React.FC<{
  propConfig: PropTypeConfig_StringLiteral<$IntentionalAny>
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<string>(
    pointerToProp,
    obj,
    propConfig,
  )

  const onChange = useCallback(
    (val: string) => {
      stuff.permanentlySetValue(val)
    },
    [propConfig, pointerToProp, obj],
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      {propConfig.as === 'menu' ? (
        <BasicSelect
          value={stuff.value}
          onChange={onChange}
          options={propConfig.options}
        />
      ) : (
        <BasicSwitch
          value={stuff.value}
          onChange={onChange}
          options={propConfig.options}
        />
      )}
    </SingleRowPropEditor>
  )
}

export default StringLiteralPropEditor
