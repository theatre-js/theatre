import type {SequenceEditorTree_Row} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'

const Container = styled.li<{}>`
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
  position: relative;
`

const NodeWrapper = styled.div<{isEven: boolean}>`
  box-sizing: border-box;
  width: 100%;
  position: relative;

  &:before {
    position: absolute;
    display: block;
    content: ' ';
    left: -40px;
    top: 0;
    bottom: 0;
    right: 0;
    box-sizing: border-box;
    border-bottom: 1px solid #252b3869;
    background: ${(props) => (props.isEven ? 'transparent' : '#6b8fb505')};
  }

  &:before {
    background: ${(props) => (props.isEven ? 'transparent' : '#6b8fb505')};
  }
`

const Children = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const Row: React.FC<{
  leaf: SequenceEditorTree_Row<unknown>
  node: React.ReactElement
}> = ({leaf, children, node}) => {
  const hasChildren = Array.isArray(children) && children.length > 0

  return (
    <Container>
      <NodeWrapper
        style={{height: leaf.nodeHeight + 'px'}}
        isEven={leaf.n % 2 === 0}
      >
        {node}
      </NodeWrapper>
      {hasChildren && <Children>{children}</Children>}
    </Container>
  )
}

export default Row
