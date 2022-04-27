import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicSwitch from '@theatre/studio/uiComponents/form/BasicSwitch'
import BasicSelect from '@theatre/studio/uiComponents/form/BasicSelect'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import type {IPropEditorFC} from './utils/IPropEditorFC'

const StringLiteralPropEditor: IPropEditorFC<
  PropTypeConfig_StringLiteral<$IntentionalAny>
> = ({propConfig, pointerToProp, obj}) => {
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
          options={propConfig.valuesAndLabels}
        />
      ) : (
        <BasicSwitch
          value={stuff.value}
          onChange={onChange}
          options={propConfig.valuesAndLabels}
        />
      )}
    </SingleRowPropEditor>
  )
}

export default StringLiteralPropEditor
