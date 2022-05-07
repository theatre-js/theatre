import type {PropTypeConfig_Boolean} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import BasicCheckbox from '@theatre/studio/uiComponents/form/BasicCheckbox'
import type {ISimplePropEditorVFC} from './utils/IPropEditorFC'

const Input = styled(BasicCheckbox)`
  margin-left: 6px;
`

const BooleanPropEditor: ISimplePropEditorVFC<PropTypeConfig_Boolean> = ({
  propConfig,
  editingTools,
  value,
}) => {
  const onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      editingTools.permanentlySetValue(Boolean(el.target.checked))
    },
    [propConfig, editingTools],
  )

  return <Input checked={value} onChange={onChange} />
}

export default BooleanPropEditor
