import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import styled, {css} from 'styled-components'
import noop from '@theatre/shared/utils/noop'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {ChevronDown, Package} from '@theatre/studio/uiComponents/icons'

export const Container = styled.li`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
`

export const BaseHeader = styled.div``

const Header = styled(BaseHeader)`
  position: relative;
  margin-top: 2px;
  margin-bottom: 2px;
  margin-left: calc(4px + var(--depth) * 16px);
  padding-left: 4px;
  padding-right: 8px;
  gap: 4px;
  height: 21px;
  line-height: 0;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;

  border-radius: 2px;
  box-shadow: 0 3px 4px -1px rgba(0, 0, 0, 0.48);

  color: rgba(255, 255, 255, 0.9);
  background: rgba(40, 43, 47, 0.65);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  &.descendant-is-selected {
    background: rgba(29, 53, 59, 0.7);
  }

  &:not(.not-selectable):not(.selected):hover {
    background: rgba(59, 63, 69, 0.9);

    border-bottom: 1px solid rgba(255, 255, 255, 0.24);
  }

  &:not(.not-selectable):not(.selected):active {
    background: rgba(82, 88, 96, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.24);
  }

  &.selected {
    background: rgba(30, 88, 102, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  // Hit zone
  &:before {
    position: absolute;
    inset: -1px -20px;
    display: block;
    content: ' ';
    z-index: 5;
    ${pointerEventsAutoInNormalMode};
  }
`

export const outlineItemFont = css`
  font-weight: 500;
  font-size: 11px;
  & {
  }
`

const Head_Label = styled.span`
  ${outlineItemFont};

  ${pointerEventsAutoInNormalMode};
  position: relative;
  // Compensate for border bottom
  top: 0.5px;
  display: flex;
  height: 20px;
  align-items: center;
  box-sizing: border-box;
`

const Head_IconContainer = styled.div`
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  opacity: 0.99;
`

const Head_Icon_WithDescendants = styled.span<{isOpen: boolean}>`
  font-size: 9px;
  position: relative;
  display: block;
`

const ChildrenContainer = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

type SelectionStatus =
  | 'not-selectable'
  | 'not-selected'
  | 'selected'
  | 'descendant-is-selected'

const BaseItem: React.FC<{
  label: React.ReactNode
  select?: VoidFn
  depth: number
  selectionStatus: SelectionStatus
  labelDecoration?: React.ReactNode
}> = ({label, children, depth, select, selectionStatus, labelDecoration}) => {
  const canContainChildren = children !== undefined

  return (
    <Container
      style={
        /* @ts-ignore */
        {'--depth': depth}
      }
    >
      <Header className={selectionStatus} onClick={select ?? noop} data-header>
        <Head_IconContainer>
          {canContainChildren ? (
            <Head_Icon_WithDescendants isOpen={true}>
              <ChevronDown />
            </Head_Icon_WithDescendants>
          ) : (
            <Package />
          )}
        </Head_IconContainer>

        <Head_Label>
          <span>{label}</span>
        </Head_Label>
        {labelDecoration}
      </Header>
      {canContainChildren && <ChildrenContainer>{children}</ChildrenContainer>}
    </Container>
  )
}

export default BaseItem
