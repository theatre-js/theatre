import type {SequenceEditorTree_Row} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'

const RightRowContainer = styled.li<{}>`
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
  position: relative;
`

const RightRowNodeWrapper = styled.div<{isEven: boolean}>`
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
`

const RightRowChildren = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

/**
 * @remarks
 * Right now, we're rendering a hierarchical dom tree that reflects the hierarchy of
 * objects, compound props, and their subs. This is not necessary and makes styling complicated.
 * Instead of this, we can simply render a list. This should be easy to do, since the view model
 * in {@link calculateSequenceEditorTree} already includes all the vertical placement information
 * (height and top) we need to render the nodes as a list.
 *
 * Note that we don't need to change {@link calculateSequenceEditorTree} to be list-based. It can
 * retain its hierarchy. It's just the DOM tree that should be list-based.
 */

const RightRow: React.FC<{
  leaf: SequenceEditorTree_Row<string>
  node: React.ReactElement
  isCollapsed: boolean
}> = ({leaf, children, node, isCollapsed}) => {
  const hasChildren = Array.isArray(children) && children.length > 0

  return leaf.shouldRender ? (
    <RightRowContainer>
      <RightRowNodeWrapper
        style={{height: leaf.nodeHeight + 'px'}}
        isEven={leaf.n % 2 === 0}
      >
        {node}
      </RightRowNodeWrapper>
      {hasChildren && <RightRowChildren>{children}</RightRowChildren>}
    </RightRowContainer>
  ) : null
}

export default RightRow
