import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './useEditingToolsForPrimitiveProp'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicSwitchEditor from '@theatre/studio/uiComponents/form/BasicSwitchEditor'
import BasicSelectEditor from '@theatre/studio/uiComponents/form/BasicSelectEditor'
import {PrimitivePropEditor} from './BooleanPropEditor'

const StringLiteralPropEditor: React.FC<{
  propConfig: PropTypeConfig_StringLiteral<$IntentionalAny>
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<string>(pointerToProp, obj)

  const onChange = useCallback(
    (val: string) => {
      stuff.permenantlySetValue(val)
    },
    [propConfig, pointerToProp, obj],
  )

  return (
    <PrimitivePropEditor {...{stuff, propConfig, pointerToProp}}>
      {propConfig.as === 'menu' ? (
        <BasicSelectEditor
          value={stuff.value}
          onChange={onChange}
          options={propConfig.options}
        />
      ) : (
        <BasicSwitchEditor
          value={stuff.value}
          onChange={onChange}
          options={propConfig.options}
        />
      )}
    </PrimitivePropEditor>
  )
}

export default StringLiteralPropEditor
