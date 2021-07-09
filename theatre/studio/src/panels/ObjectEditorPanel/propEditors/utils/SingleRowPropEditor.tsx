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

export const propNameText = css`
  font-weight: 300;
  font-size: 11px;
  color: #9a9a9a;
  text-shadow: 0.5px 0.5px 2px rgba(0, 0, 0, 0.3);

  &:hover {
    color: white;
  }
`

const Row = styled.div`
  display: flex;
  height: 30px;
  justify-content: flex-start;
  align-items: center;
`

const PropNameContainer = styled.div`
  margin-right: 4px;
  text-align: right;
  flex: 0 0;
  flex-basis: 106px;

  ${propNameText};
`

const ControlsContainer = styled.div`
  flex-basis: 8px;
  flex: 0 0;
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
  padding: 0 16px 0 2px;
  box-sizing: border-box;
  height: 100%;
  flex: 1 1;
`

export const SingleRowPropEditor: React.FC<{
  propConfig: propTypes.PropTypeConfig
  pointerToProp: SheetObject['propsP']
  stuff: ReturnType<typeof useEditingToolsForPrimitiveProp>
}> = ({propConfig, pointerToProp, stuff, children}) => {
  const label = propConfig.label ?? last(getPointerParts(pointerToProp).path)

  const [propNameContainerRef, propNameContainer] =
    useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useContextMenu(propNameContainer, {
    items: stuff.contextMenuItems,
  })

  const color = shadeToColor[stuff.shade]

  return (
    <Row>
      {contextMenu}
      <PropNameContainer
        ref={propNameContainerRef}
        title={['obj', 'props', ...getPointerParts(pointerToProp).path].join(
          '.',
        )}
      >
        {label}
      </PropNameContainer>
      <ControlsContainer>{stuff.controlIndicators}</ControlsContainer>
      <InputContainer>{children}</InputContainer>
    </Row>
  )
}
