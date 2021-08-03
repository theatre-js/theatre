import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {GoChevronRight, DiHtml53DEffects} from 'react-icons/all'
import styled, {css} from 'styled-components'
import noop from '@theatre/shared/utils/noop'
import {transparentize, darken, opacify, lighten} from 'polished'
import {rowBgColor} from '@theatre/studio/panels/ObjectEditorPanel/propEditors/utils/SingleRowPropEditor'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

export const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{}>``

const baseBg = lighten(0.05, rowBgColor)

const baseFontColor = transparentize(0.25, 'white')
const baseBorderColor = transparentize(0.88, 'white')

export const outlinePanelTheme = {baseBg, baseFontColor, baseBorderColor}

const Header = styled(BaseHeader)`
  padding-left: calc(4px + var(--depth) * 16px);
  height: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: ${baseFontColor};
  --item-bg: ${baseBg};
  --item-border-color: ${baseBorderColor};

  &:hover {
    color: ${opacify(1, baseFontColor)};

    --item-bg: ${() => darken(0.07, baseBg)};
    --item-border-color: ${opacify(0.1, baseBorderColor)};
  }

  &.selected {
    color: ${opacify(1, baseFontColor)};

    --item-bg: ${() => darken(0.15, baseBg)};
    --item-border-color: ${opacify(0.05, baseBorderColor)};
  }

  &.descendant-is-selected {
    color: ${opacify(0.1, baseFontColor)};

    --item-bg: ${() => darken(0.05, baseBg)};
    --item-border-color: ${baseBorderColor};
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
  display: block;
  height: 13px;
  background-color: var(--item-bg);
  /* border-radius: 2px; */

  &:after {
    border: 1px solid var(--item-border-color);
    position: absolute;
    inset: -1px;
    display: block;
    content: ' ';
    z-index: -1;
    pointer-events: none;
    border-radius: 2px;
    box-sizing: border-box;
    box-shadow: 1px 1px 0 rgba(0, 0, 0, 0.2);
  }

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
  /* background-color: #435356d9; */
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
    opacity: 0.75;
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
