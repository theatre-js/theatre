import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {GoChevronRight, DiHtml53DEffects} from 'react-icons/all'
import styled, {css} from 'styled-components'
import noop from '@theatre/shared/utils/noop'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

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

const baseBg = `#3e4447`

const baseBorderColor = `#34343e`

const Header = styled(BaseHeader)`
  padding-left: calc(4px + var(--depth) * 16px);
  padding-right: 8px;
  height: 28px;
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  pointer-events: none;
  white-space: nowrap;

  color: rgba(255, 255, 255, 0.75);
  --item-bg: ${baseBg};
  --item-border-color: ${baseBorderColor};

  &.descendant-is-selected {
    color: rgba(255, 255, 255, 0.9);

    --item-bg: #2e4244ed;
    --item-border-color: #254355;
  }

  &:hover {
    color: #fff;

    --item-bg: #1e5866;
    --item-border-color: #152f42;
  }

  &.selected {
    color: rgba(255, 255, 255, 0.9);

    --item-bg: #1e5866;
    --item-border-color: #152f42;
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

  padding: 2px 8px;
  ${pointerEventsAutoInNormalMode};
  position: relative;
  display: flex;
  height: 17px;
  align-items: center;

  background-color: var(--item-bg);

  &:after {
    border: 1px solid var(--item-border-color);
    position: absolute;
    inset: 0px;
    display: block;
    content: ' ';
    z-index: -1;
    pointer-events: none;
    border-radius: 2px;
    box-sizing: border-box;
    box-shadow: 0px 3px 4px -1px rgba(0, 0, 0, 0.48);
  }

  // hit-zone
  &:before {
    position: absolute;
    inset: -1px -20px;
    display: block;
    content: ' ';
    z-index: 0;
    ${pointerEventsAutoInNormalMode};
  }
`

const Head_IconContainer = styled.span`
  width: 18px;
  box-sizing: border-box;
  height: 18px;
  margin-right: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.99;

  &:after {
    display: block;
    content: ' ';
    position: absolute;
    inset: 0px;
    z-index: -1;
    background-color: var(--item-bg);
    opacity: 0.6;
    border-radius: 2px;
  }
`

const Head_Icon_WithDescendants = styled.span<{isOpen: boolean}>`
  font-size: 9px;
  position: relative;
  display: block;
  transform: rotateZ(${(props) => (props.isOpen ? 90 : 0)}deg);
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
      <Header className={selectionStatus} onClick={select ?? noop}>
        <Head_IconContainer>
          {canContainChildren ? (
            <Head_Icon_WithDescendants isOpen={true}>
              <GoChevronRight />
            </Head_Icon_WithDescendants>
          ) : (
            <DiHtml53DEffects />
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
