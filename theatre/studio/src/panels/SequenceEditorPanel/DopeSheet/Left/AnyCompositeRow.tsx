import {theme} from '@theatre/studio/css'
import type {SequenceEditorTree_Row} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {HiOutlineChevronRight} from 'react-icons/all'
import styled from 'styled-components'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'

export const LeftRowContainer = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{isEven: boolean}>`
  border-bottom: 1px solid #7695b705;
`

const LeftRowHeader = styled(BaseHeader)<{
  isSelectable: boolean
  isSelected: boolean
}>`
  padding-left: calc(8px + var(--depth) * 20px);

  display: flex;
  align-items: stretch;
  color: ${theme.panel.body.compoudThing.label.color};

  box-sizing: border-box;

  ${(props) => props.isSelected && `background: blue`};
`

const LeftRowHead_Label = styled.span`
  ${propNameTextCSS};
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 26px;
  flex-wrap: nowrap;
`

const LeftRowHead_Icon = styled.span<{isCollapsed: boolean}>`
  width: 12px;
  padding: 8px;
  font-size: 9px;
  display: flex;
  align-items: center;

  transition: transform 0.05s ease-out, color 0.1s ease-out;
  transform: rotateZ(${(props) => (props.isCollapsed ? 0 : 90)}deg);
  color: #66686a;

  &:hover {
    transform: rotateZ(${(props) => (props.isCollapsed ? 15 : 75)}deg);
    color: #c0c4c9;
  }
`

const LeftRowChildren = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const AnyCompositeRow: React.FC<{
  leaf: SequenceEditorTree_Row<string>
  label: React.ReactNode
  toggleSelect?: VoidFn
  toggleCollapsed: VoidFn
  isSelected?: boolean
  isSelectable?: boolean
  isCollapsed: boolean
}> = ({
  leaf,
  label,
  children,
  isSelectable,
  isSelected,
  toggleSelect,
  toggleCollapsed,
  isCollapsed,
}) => {
  const hasChildren = Array.isArray(children) && children.length > 0

  return leaf.shouldRender ? (
    <LeftRowContainer depth={leaf.depth}>
      <LeftRowHeader
        style={{
          height: leaf.nodeHeight + 'px',
        }}
        isSelectable={isSelectable === true}
        isSelected={isSelected === true}
        onClick={toggleSelect}
        isEven={leaf.n % 2 === 0}
      >
        <LeftRowHead_Icon isCollapsed={isCollapsed} onClick={toggleCollapsed}>
          <HiOutlineChevronRight />
        </LeftRowHead_Icon>
        <LeftRowHead_Label>{label}</LeftRowHead_Label>
      </LeftRowHeader>
      {hasChildren && <LeftRowChildren>{children}</LeftRowChildren>}
    </LeftRowContainer>
  ) : null
}

export default AnyCompositeRow
