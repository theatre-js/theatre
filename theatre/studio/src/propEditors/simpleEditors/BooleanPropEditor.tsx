import type {PropTypeConfig_Boolean} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import BasicCheckbox from '@theatre/studio/uiComponents/form/BasicCheckbox'
import type {ISimplePropEditorReactProps} from './ISimplePropEditorReactProps'
import {deriver} from '@theatre/studio/utils/derive-utils'

const Input = deriver(styled(BasicCheckbox)`
  margin-left: 6px;
`)

function BooleanPropEditor({
  propConfig,
  editingToolsD,
  valueD,
}: ISimplePropEditorReactProps<PropTypeConfig_Boolean>) {
  const onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      editingToolsD.getValue().permanentlySetValue(Boolean(el.target.checked))
    },
    [propConfig, editingToolsD],
  )

  return <Input checked={valueD} onChange={onChange} />
}

export default BooleanPropEditor
