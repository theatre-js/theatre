import type * as propTypes from '@theatre/core/propTypes'
import {getPointerParts} from '@theatre/dataverse'
import type {Pointer} from '@theatre/dataverse'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {last} from 'lodash-es'
import React from 'react'
import type {useEditingToolsForSimplePropInDetailsPanel} from '@theatre/studio/propEditors/useEditingToolsForSimpleProp'
import styled, {css} from 'styled-components'
import {transparentize} from 'polished'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'

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

  ${propNameTextCSS};
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

type ISingleRowPropEditorProps<T> = {
  propConfig: propTypes.PropTypeConfig
  pointerToProp: Pointer<T>
  editingTools: ReturnType<typeof useEditingToolsForSimplePropInDetailsPanel>
}

export function SingleRowPropEditor<T>({
  propConfig,
  pointerToProp,
  editingTools,
  children,
}: React.PropsWithChildren<ISingleRowPropEditorProps<T>>): React.ReactElement<
  any,
  any
> | null {
  const label = propConfig.label ?? last(getPointerParts(pointerToProp).path)

  const [propNameContainerRef, propNameContainer] =
    useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useContextMenu(propNameContainer, {
    menuItems: editingTools.contextMenuItems,
  })

  return (
    <Row>
      {contextMenu}
      <Left>
        <ControlsContainer>{editingTools.controlIndicators}</ControlsContainer>

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
