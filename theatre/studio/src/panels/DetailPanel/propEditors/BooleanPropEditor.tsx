import type {PropTypeConfig_Boolean} from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import React, {useCallback} from 'react'
import {useEditingToolsForPrimitiveProp} from './utils/useEditingToolsForPrimitiveProp'
import {SingleRowPropEditor} from './utils/SingleRowPropEditor'
import styled from 'styled-components'
import BasicCheckbox from '@theatre/studio/uiComponents/form/BasicCheckbox'

const Input = styled(BasicCheckbox)`
  margin-left: 6px;
`

const BooleanPropEditor: React.FC<{
  propConfig: PropTypeConfig_Boolean
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<boolean>(
    pointerToProp,
    obj,
    propConfig,
  )

  const onChange = useCallback(
    (el: React.ChangeEvent<HTMLInputElement>) => {
      stuff.permenantlySetValue(Boolean(el.target.checked))
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
