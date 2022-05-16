import {theme} from '@theatre/studio/css'
import type {SequenceEditorTree_Row} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {HiOutlineChevronRight} from 'react-icons/all'
import styled from 'styled-components'
import {propNameTextCSS} from '@theatre/studio/propEditors/utils/propNameTextCSS'

export const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{isEven: boolean}>`
  border-bottom: 1px solid #7695b705;
`

const Header = styled(BaseHeader)<{
  isSelectable: boolean
  isSelected: boolean
}>`
  padding-left: calc(16px + var(--depth) * 20px);

  display: flex;
  align-items: stretch;
  color: ${theme.panel.body.compoudThing.label.color};

  box-sizing: border-box;

  ${(props) => props.isSelected && `background: blue`};
`

const Head_Label = styled.span`
  ${propNameTextCSS};
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 4px;
  line-height: 26px;
  flex-wrap: nowrap;
`

const Head_Icon = styled.span<{isOpen: boolean}>`
  width: 12px;
  margin-right: 8px;
  font-size: 9px;
  display: flex;
  align-items: center;

  transform: rotateZ(${(props) => (props.isOpen ? 90 : 0)}deg);
`

const Children = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const AnyCompositeRow: React.FC<{
  leaf: SequenceEditorTree_Row<unknown>
  label: React.ReactNode
  toggleSelect?: VoidFn
  isSelected?: boolean
  isSelectable?: boolean
}> = ({leaf, label, children, isSelectable, isSelected, toggleSelect}) => {
  const hasChildren = Array.isArray(children) && children.length > 0

  return (
    <Container depth={leaf.depth}>
      <Header
        style={{
          height: leaf.nodeHeight + 'px',
        }}
        isSelectable={isSelectable === true}
        isSelected={isSelected === true}
        onClick={toggleSelect}
        isEven={leaf.n % 2 === 0}
      >
        <Head_Icon isOpen={true}>
          <HiOutlineChevronRight />
        </Head_Icon>
        <Head_Label>{label}</Head_Label>
      </Header>
      {hasChildren && <Children>{children}</Children>}
    </Container>
  )
}

export default AnyCompositeRow
