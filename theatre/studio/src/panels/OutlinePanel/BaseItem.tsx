import {theme} from '@theatre/studio/css'
import type {VoidFn} from '@theatre/shared/utils/types'
import React from 'react'
import {GoChevronRight} from 'react-icons/go'
import styled from 'styled-components'
import noop from '@theatre/shared/utils/noop'
import {lighten} from 'polished'

export const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

export const BaseHeader = styled.div<{}>``

const Header = styled(BaseHeader)<{
  selectionStatus: SelectionStatus
}>`
  padding-left: calc(16px + var(--depth) * 20px);
  height: 28px;

  display: flex;
  align-items: center;
  color: ${({selectionStatus}) =>
    lighten(
      selectionStatus === 'selected' ? 0.2 : 0,
      theme.panel.body.compoudThing.label.color,
    )};

  background: ${({selectionStatus}) =>
    selectionStatus === 'selected'
      ? '#1919245e'
      : selectionStatus === 'descendant-is-selected'
      ? '#19192426'
      : 'transparent'};

  box-sizing: border-box;

  &:hover {
    color: ${lighten(0.2, theme.panel.body.compoudThing.label.color)};
  }
`

const Head_Label = styled.span``

const Head_IconContainer = styled.span`
  width: 12px;
  margin-right: 8px;
`

const Head_Icon = styled.span<{isOpen: boolean}>`
  width: 12px;
  font-size: 13px;
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
      <Header selectionStatus={selectionStatus} onClick={select ?? noop}>
        <Head_IconContainer>
          {canContainChildren && (
            <Head_Icon isOpen={true}>
              <GoChevronRight />
            </Head_Icon>
          )}
        </Head_IconContainer>

        <Head_Label>{label}</Head_Label>
      </Header>
      {canContainChildren && <ChildrenContainer>{children}</ChildrenContainer>}
    </Container>
  )
}

export default BaseItem
