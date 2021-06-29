import type {PropTypeConfig_Number} from '@theatre/shared/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import BasicNumberEditor from '@theatre/studio/uiComponents/BasicNumberEditor'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {getPointerParts} from '@theatre/dataverse'
import {last} from 'lodash-es'
import React from 'react'
import styled from 'styled-components'
import {
  shadeToColor,
  useEditingToolsForPrimitiveProp,
} from './useEditingToolsForPrimitiveProp'

const Container = styled.div`
  display: flex;
  height: 30px;
  justify-content: flex-end;
  align-items: center;
`

export const NumberPropEditor_theme = {
  label: {
    color: `#787878`,
  },
}

const Label = styled.div`
  margin-right: 4px;
  font-weight: 200;
  font-size: 12px;
  color: ${NumberPropEditor_theme.label.color};
  cursor: default;
  text-align: right;

  &:hover {
    color: white;
  }
`
const Body = styled.div`
  cursor: ew-resize;
  display: flex;
  width: 140px;
  height: 100%;
  margin-right: 16px;
  margin-left: 4px;
`

const NumberPropEditor: React.FC<{
  propConfig: PropTypeConfig_Number
  pointerToProp: SheetObject['propsP']
  obj: SheetObject
}> = ({propConfig, pointerToProp, obj}) => {
  const stuff = useEditingToolsForPrimitiveProp<number>(pointerToProp, obj)

  const label = last(getPointerParts(pointerToProp).path)

  const [labelRef, labelNode] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useContextMenu(labelNode, {
    items: stuff.contextMenuItems,
  })

  const color = shadeToColor[stuff.shade]

  return (
    <Container
      style={
        {
          /* backgroundColor: color */
        }
      }
    >
      {contextMenu}
      <Label ref={labelRef}>{label}</Label>
      {stuff.controlIndicators}
      <Body>
        <BasicNumberEditor
          value={stuff.value}
          temporarilySetValue={stuff.temporarilySetValue}
          discardTemporaryValue={stuff.discardTemporaryValue}
          permenantlySetValue={stuff.permenantlySetValue}
        />
      </Body>
    </Container>
  )
}

export default NumberPropEditor
