import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {GoChevronRight, DiHtml53DEffects} from 'react-icons/all'
import styled, {css} from 'styled-components'
import noop from '@theatre/shared/utils/noop'

export const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{}>``

const Header = styled(BaseHeader)`
  padding-left: calc(16px + var(--depth) * 16px);
  height: 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  pointer-events: none;

  &.selected {
  }

  &.descendant-is-selected {
  }
`

export const outlineItemFont = css`
  font-weight: 500;
  font-size: 11px;
`

const Head_Label = styled.span`
  ${outlineItemFont};
  color: #ffffffdb;
  background-color: #758184;
  padding: 2px 8px;
  border-radius: 2px;
  pointer-events: auto;

  ${Header}:hover > & {
    background-color: red;
  }

  ${Header}.selected > & {
    color: white;
    background-color: #464242;
  }
`

const Head_IconContainer = styled.span`
  width: 12px;
  margin-right: 8px;
  /* background-color: #435356d9; */
  color: black;
  font-weight: 500;

  ${Header}.selected > & {
    color: white;
    background-color: #464242;
  }
`

const Head_Icon_WithDescendants = styled.span<{isOpen: boolean}>`
  width: 12px;
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
}> = ({label, children, depth, select, selectionStatus}) => {
  const canContainChildren = children !== undefined

  return (
    <Container depth={depth}>
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

        <Head_Label>{label}</Head_Label>
      </Header>
      {canContainChildren && <ChildrenContainer>{children}</ChildrenContainer>}
    </Container>
  )
}

export default BaseItem
