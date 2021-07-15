import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {GoChevronRight, DiHtml53DEffects} from 'react-icons/all'
import styled, {css} from 'styled-components'
import noop from '@theatre/shared/utils/noop'
import {lighten, transparentize} from 'polished'

export const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{}>``

const Header = styled(BaseHeader)`
  padding-left: calc(4px + var(--depth) * 16px);
  height: 22px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  pointer-events: none;

  --item-bg: #393d42b8;
  --item-border-color: ${() => lighten(0.05, '#393d42b8')};
  color: ${() => transparentize(0.25, 'white')};

  &:hover {
    color: white;

    --item-bg: ${() => lighten(0.1, '#393d42b8')};
    --item-border-color: ${() => lighten(0.45, '#393d42b8')};
  }

  &.selected {
    color: white;

    --item-bg: ${() => lighten(0.2, '#393d42b8')};
    --item-border-color: ${() => lighten(0.45, '#393d42b8')};
  }

  &.descendant-is-selected {
    color: ${() => transparentize(0.15, 'white')};

    --item-bg: ${() => lighten(0.05, '#393d42b8')};
    --item-border-color: ${() => lighten(0.1, '#393d42b8')};
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
  pointer-events: auto;
  position: relative;
  display: block;
  height: 15px;
  background-color: var(--item-bg);
  border-radius: 2px;

  &:after {
    border: 1px solid var(--item-border-color);
    position: absolute;
    inset: 0px;
    display: block;
    content: ' ';
    z-index: -1;
    pointer-events: none;
    border-radius: 2px;
  }

  &:before {
    position: absolute;
    inset: -1px -20px;
    display: block;
    content: ' ';
    z-index: 0;
    pointer-events: auto;
  }
`

const Head_IconContainer = styled.span`
  width: 18px;
  box-sizing: border-box;
  height: 18px;
  margin-right: 4px;
  /* background-color: #435356d9; */
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  opacity: 0.9;

  &:after {
    display: block;
    content: ' ';
    position: absolute;
    inset: 0px;
    z-index: -1;
    background-color: var(--item-bg);
    opacity: 0.3;
    border-radius: 2px;
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
