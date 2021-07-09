import type * as propTypes from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getPointerParts} from '@theatre/dataverse'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {last} from 'lodash-es'
import React from 'react'
import type {useEditingToolsForPrimitiveProp} from '@theatre/studio/panels/ObjectEditorPanel/propEditors/utils/useEditingToolsForPrimitiveProp'
import {shadeToColor} from '@theatre/studio/panels/ObjectEditorPanel/propEditors/utils/useEditingToolsForPrimitiveProp'
import styled, {css} from 'styled-components'

export const labelText = css`
  font-weight: 300;
  font-size: 11px;
  color: #9a9a9a;
  text-shadow: 0.5px 0.5px 2px black;

  &:hover {
    color: white;
  }
`

const Container = styled.div`
  display: flex;
  height: 30px;
  justify-content: flex-end;
  align-items: center;
`

const Label = styled.label`
  margin-right: 4px;
  text-align: right;
  ${labelText};
`
const Body = styled.label`
  display: flex;
  align-items: center;
  padding-left: 8px;
  box-sizing: border-box;
  width: 140px;
  height: 100%;
  margin-right: 16px;
  margin-left: 4px;
`

export const SingleRowPropEditor: React.FC<{
  propConfig: propTypes.PropTypeConfig
  pointerToProp: SheetObject['propsP']
  stuff: ReturnType<typeof useEditingToolsForPrimitiveProp>
}> = ({propConfig, pointerToProp, stuff, children}) => {
  const label = propConfig.label ?? last(getPointerParts(pointerToProp).path)

  const [labelRef, labelNode] = useRefAndState<HTMLLabelElement | null>(null)

  const [contextMenu] = useContextMenu(labelNode, {
    items: stuff.contextMenuItems,
  })

  const color = shadeToColor[stuff.shade]

  return (
    <Container>
      {contextMenu}
      <Label
        ref={labelRef}
        title={['obj', 'props', ...getPointerParts(pointerToProp).path].join(
          '.',
        )}
      >
        {label}
      </Label>
      {stuff.controlIndicators}
      <Body>{children}</Body>
    </Container>
  )
}
