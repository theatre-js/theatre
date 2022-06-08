import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import BasicSwitch from '@theatre/studio/uiComponents/form/BasicSwitch'
import BasicSelect from '@theatre/studio/uiComponents/form/BasicSelect'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'
import {useDerivation} from '@theatre/react'

function StringLiteralPropEditor<TLiteralOptions extends string>({
  propConfig,
  editingToolsD,
  valueD,
}: ISimplePropEditorReactProps<PropTypeConfig_StringLiteral<TLiteralOptions>>) {
  const value = useDerivation(valueD)
  const editingTools = useDerivation(editingToolsD)

  const onChange = useCallback(
    (val: TLiteralOptions) => {
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
