import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import BasicSwitch from '@theatre/studio/uiComponents/form/BasicSwitch'
import BasicSelect from '@theatre/studio/uiComponents/form/BasicSelect'
import type {ISimplePropEditorVFC} from './utils/IPropEditorFC'

const StringLiteralPropEditor: ISimplePropEditorVFC<
  PropTypeConfig_StringLiteral<$IntentionalAny>
> = ({propConfig, editingTools, value}) => {
  const onChange = useCallback(
    (val: string) => {
      editingTools.permanentlySetValue(val)
    },
    [propConfig, editingTools],
  )

  return propConfig.as === 'menu' ? (
    <BasicSelect
      value={value}
      onChange={onChange}
      options={propConfig.valuesAndLabels}
    />
  ) : (
    <BasicSwitch
      value={value}
      onChange={onChange}
      options={propConfig.valuesAndLabels}
    />
  )
}

export default StringLiteralPropEditor
