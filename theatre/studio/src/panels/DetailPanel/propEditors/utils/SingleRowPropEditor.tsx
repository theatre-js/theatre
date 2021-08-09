import type * as propTypes from '@theatre/core/propTypes'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import {getPointerParts} from '@theatre/dataverse'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {last} from 'lodash-es'
import React from 'react'
import type {useEditingToolsForPrimitiveProp} from '@theatre/studio/panels/DetailPanel/propEditors/utils/useEditingToolsForPrimitiveProp'
import {shadeToColor} from '@theatre/studio/panels/DetailPanel/propEditors/utils/useEditingToolsForPrimitiveProp'
import styled, {css} from 'styled-components'
import {transparentize} from 'polished'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

export const indentationFormula = `calc(var(--left-pad) + var(--depth) * var(--step))`

export const rowBgColor = transparentize(0.05, '#282b2f')

export const rowBg = css`
  &:after,
  &:before {
    position: absolute;
    display: block;
    content: ' ';
    z-index: -1;
    box-sizing: content-box;
  }

  &:after {
    inset: 0px 0 1px calc(-2px + var(--left-pad) + var(--depth) * var(--step));
    background-color: ${rowBgColor};
  }

  &:before {
    height: 2px;
    right: 0;
    bottom: 0px;
    left: calc(-2px + var(--left-pad) + var(--depth) * var(--step));
    background-color: ${transparentize(0.2, rowBgColor)};
  }
`

export const propNameText = css`
  font-weight: 300;
  font-size: 11px;
  color: #9a9a9a;
  text-shadow: 0.5px 0.5px 2px rgba(0, 0, 0, 0.3);
`

const Row = styled.div`
  display: flex;
  height: 30px;
  justify-content: flex-start;
  align-items: stretch;
  --right-width: 60%;
  position: relative;
  ${pointerEventsAutoInNormalMode};

  ${rowBg};
`

const Left = styled.div`
  box-sizing: border-box;
  padding-left: ${indentationFormula};
  padding-right: 4px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  flex-grow: 0;
  flex-shrink: 0;
  width: calc(100% - var(--right-width));
`

const PropNameContainer = styled.div`
  text-align: left;
  flex: 1 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  user-select: none;
  cursor: default;

  ${propNameText};
  &:hover {
    color: white;
  }
`

const ControlsContainer = styled.div`
  flex-basis: 8px;
  flex: 0 0;
  display: flex;
  align-items: center;
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: stretch;
  padding: 0 8px 0 2px;
  box-sizing: border-box;
  height: 100%;
  width: var(--right-width);
  flex-shrink: 0;
  flex-grow: 0;
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
      <Left>
        <ControlsContainer>{stuff.controlIndicators}</ControlsContainer>

        <PropNameContainer
          ref={propNameContainerRef}
          title={['obj', 'props', ...getPointerParts(pointerToProp).path].join(
            '.',
          )}
        >
          {label}
        </PropNameContainer>
      </Left>

      <InputContainer>{children}</InputContainer>
    </Row>
  )
}
