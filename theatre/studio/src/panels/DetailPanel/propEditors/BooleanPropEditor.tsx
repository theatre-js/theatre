import type {PropTypeConfig_Boolean} from '@theatre/core/propTypes'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import styled from 'styled-components'
import BasicCheckbox from '@theatre/studio/uiComponents/form/BasicCheckbox'
import type {IPropEditorFC} from './utils/IPropEditorFC'

const Input = styled(BasicCheckbox)`
  margin-left: 6px;
`

const BooleanPropEditor: IPropEditorFC<PropTypeConfig_Boolean> = ({
  propConfig,
  pointerToProp,
  obj,
}) => {
  const stuff = useEditingToolsForPrimitiveProp<boolean>(
    pointerToProp,
    obj,
    propConfig,
  )

  const onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      stuff.permanentlySetValue(Boolean(el.target.checked))
    },
    [propConfig, pointerToProp, obj],
  )

  return (
    <SingleRowPropEditor {...{stuff, propConfig, pointerToProp}}>
      <Input checked={stuff.value} onChange={onChange} />
    </SingleRowPropEditor>
  )
}

export default BooleanPropEditor
