import type {PropTypeConfig_StringLiteral} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import BasicSwitch from '@theatre/studio/uiComponents/form/BasicSwitch'
import BasicSelect from '@theatre/studio/uiComponents/form/BasicSelect'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'

function StringLiteralPropEditor<TLiteralOptions extends string>({
  propConfig,
  editingTools,
  value,
}: ISimplePropEditorReactProps<PropTypeConfig_StringLiteral<TLiteralOptions>>) {
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
