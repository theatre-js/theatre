import type {SequenceEditorTree_PrimitiveProp} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import React from 'react'
import styled from 'styled-components'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {getCopiedKeyframes} from '@theatre/studio/selectors'
import getStudio from '@theatre/studio/getStudio'

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
`

const Children = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`
interface IProps {
  leaf: SequenceEditorTree_PrimitiveProp
  copiedKeyframes: Keyframe[]
}

const Row: React.FC<{
  leaf: SequenceEditorTree_PrimitiveProp
  node: React.ReactElement
}> = ({leaf, children, node}) => {
  const {trackId} = leaf
  const copiedKeyframes = getCopiedKeyframes()
  const [ref, refNode] = useRefAndState<HTMLDivElement | null>(null)
  const [contextMenu] = useTrackContextMenu(refNode, {
    leaf,
    copiedKeyframes,
  })

  const hasChildren = Array.isArray(children) && children.length > 0

  return (
    <Container>
      <NodeWrapper
        style={{height: leaf.nodeHeight + 'px'}}
        isEven={leaf.n % 2 === 0}
        ref={ref}
      >
        {node}
      </NodeWrapper>
      {hasChildren && <Children>{children}</Children>}
      {/* TODO: update useContextMenu so it renders null if !items.length */}
      {trackId && copiedKeyframes.length ? contextMenu : null}
    </Container>
  )
}

function useTrackContextMenu(
  node: HTMLDivElement | null,
  {leaf, copiedKeyframes}: IProps,
) {
  return useContextMenu(node, {
    items: () => {
      const items = []
      const {trackId, sheetObject} = leaf

      if (trackId && copiedKeyframes.length) {
        items.push({
          label: `Paste ${copiedKeyframes.length} keyframe(s)`,
          callback: () => {
            getStudio().pasteKeyframes({
              trackId,
              address: sheetObject.address,
              keyframes: copiedKeyframes,
            })
          },
        })
      }

      return items
    },
  })
}

export default Row
