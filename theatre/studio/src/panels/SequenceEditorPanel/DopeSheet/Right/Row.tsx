import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import {usePasteKeyframesItem} from '@theatre/studio/uiComponents/simpleContextMenu/useCopyPasteKeyframesItem'

const Container = styled.li<{}>`
  margin: 0;
  padding: 0;
  list-style: none;
  box-sizing: border-box;
  position: relative;
`

const NodeWrapper = styled.div<{isEven: boolean; canHighlight: boolean}>`
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
    transition: background 0.15s ease-in-out;
  }

  &:hover:before {
    transition: background 0.05s ease-in-out;
    background: ${(props) =>
      props.canHighlight
        ? '#7a22221f'
        : props.isEven
        ? 'transparent'
        : '#6b8fb505'};
  }
`

const Children = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

type LeafTypes =
  | SequenceEditorTree_SheetObject
  | SequenceEditorTree_PropWithChildren
  | SequenceEditorTree_PrimitiveProp
interface IProps {
  leaf: LeafTypes
}

const Row: React.FC<{
  leaf: LeafTypes
  node: React.ReactElement
}> = ({leaf, children, node}) => {
  const {trackId} = leaf
  const [ref, refNode] = useRefAndState<HTMLDivElement | null>(null)
  const [contextMenu] = useTrackContextMenu(refNode, {
    leaf,
  })

  const hasChildren = Array.isArray(children) && children.length > 0

  return (
    <Container>
      <NodeWrapper
        style={{height: leaf.nodeHeight + 'px'}}
        isEven={leaf.n % 2 === 0}
        ref={ref}
        canHighlight={Boolean(trackId)}
      >
        {node}
      </NodeWrapper>
      {hasChildren && <Children>{children}</Children>}
      {trackId ? contextMenu : null}
    </Container>
  )
}

function useTrackContextMenu(node: HTMLDivElement | null, {leaf}: IProps) {
  const pasteKeyframesItem = usePasteKeyframesItem(leaf)
  return useContextMenu(node, {
    items: () => {
      if (pasteKeyframesItem) {
        return [pasteKeyframesItem]
      }
      return []
    },
  })
}

export default Row
