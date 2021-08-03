import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {$IntentionalAny, VoidFn} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {lighten} from 'polished'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import {panelDimsToPanelPosition, usePanel} from './BasePanel'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const Base = styled.div`
  position: absolute;
  z-index: 10;
  ${pointerEventsAutoInNormalMode};
  &:after {
    position: absolute;
    top: -2px;
    right: -2px;
    bottom: -2px;
    left: -2px;
    display: block;
    content: ' ';
  }

  opacity: 0;
  background-color: #478698;

  &.isHighlighted {
    opacity: 0.7;
  }

  &.isDragging {
    opacity: 1;
    /* background-color: ${lighten(0.2, '#478698')}; */
  }

  &:hover {
    opacity: 1;
  }
`

const Horizontal = styled(Base)`
  left: 0;
  right: 0;
  height: 1px;
`

const Top = styled(Horizontal)`
  top: 0;
`

const Bottom = styled(Horizontal)`
  bottom: 0;
`

const Vertical = styled(Base)`
  top: 0;
  bottom: 0;
  width: 1px;
`

const Left = styled(Vertical)`
  left: 0;
`

const Right = styled(Vertical)`
  right: 0;
`

const Square = styled(Base)`
  width: 8px;
  height: 8px;
`

const TopLeft = styled(Square)`
  top: 0;
  left: 0;
`

const TopRight = styled(Square)`
  top: 0;
  right: 0;
`

const BottomLeft = styled(Square)`
  bottom: 0;
  left: 0;
`

const BottomRight = styled(Square)`
  bottom: 0;
  right: 0;
`

const els = {
  Top,
  TopLeft,
  TopRight,
  Bottom,
  BottomLeft,
  BottomRight,
  Left,
  Right,
}

type Which =
  | 'Top'
  | 'Bottom'
  | 'Left'
  | 'Right'
  | 'TopLeft'
  | 'TopRight'
  | 'BottomLeft'
  | 'BottomRight'

const cursors: {[which in Which]: string} = {
  Top: 'ns-resize',
  Bottom: 'ns-resize',
  Left: 'ew-resize',
  Right: 'ew-resize',
  TopLeft: 'nw-resize',
  TopRight: 'ne-resize',
  BottomLeft: 'sw-resize',
  BottomRight: 'se-resize',
}

const PanelResizeHandle: React.FC<{
  which: Which
}> = ({which}) => {
  const panelStuff = usePanel()
  const panelStuffRef = useRef(panelStuff)
  panelStuffRef.current = panelStuff
  const [isDragging, setIsDragging] = useState(false)

  const [ref, node] = useRefAndState<HTMLDivElement>(null as $IntentionalAny)
  const dragOpts: Parameters<typeof useDrag>[1] = useMemo(() => {
    let stuffBeforeDrag = panelStuffRef.current
    let tempTransaction: CommitOrDiscard | undefined
    let unlock: VoidFn | undefined

    return {
      lockCursorTo: cursors[which],
      onDragStart() {
        stuffBeforeDrag = panelStuffRef.current
        setIsDragging(true)
        if (unlock) {
          const u = unlock
          unlock = undefined
          u()
        }
        unlock = panelStuff.addBoundsHighlightLock()
      },
      onDrag(dx, dy) {
        const newDims: typeof panelStuff['dims'] = {
          ...stuffBeforeDrag.dims,
        }

        if (which.startsWith('Bottom')) {
          newDims.height = Math.max(
            newDims.height + dy,
            stuffBeforeDrag.minDims.height,
          )
        } else if (which.startsWith('Top')) {
          const bottom = newDims.top + newDims.height
          const top = Math.min(
            bottom - stuffBeforeDrag.minDims.height,
            newDims.top + dy,
          )
          const height = bottom - top

          newDims.height = height
          newDims.top = top
        }
        if (which.endsWith('Left')) {
          const right = newDims.left + newDims.width
          const left = Math.min(
            right - stuffBeforeDrag.minDims.width,
            newDims.left + dx,
          )
          const width = right - left

          newDims.width = width
          newDims.left = left
        } else if (which.endsWith('Right')) {
          newDims.width = Math.max(
            newDims.width + dx,
            stuffBeforeDrag.minDims.width,
          )
        }

        const position = panelDimsToPanelPosition(newDims, {
          width: window.innerWidth,
          height: window.innerHeight,
        })

        tempTransaction?.discard()
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.studio.historic.panelPositions.setPanelPosition({
            position,
            panelId: stuffBeforeDrag.panelId,
          })
        })
      },
      onDragEnd(dragHappened) {
        if (unlock) {
          const u = unlock
          unlock = undefined
          u()
        }
        setIsDragging(false)
        if (dragHappened) {
          tempTransaction?.commit()
        } else {
          tempTransaction?.discard()
        }
        tempTransaction = undefined
      },
    }
  }, [which])

  useDrag(node, dragOpts)
  const Comp = els[which]

  const isOnCorner = which.length <= 6

  return (
    <Comp
      ref={ref}
      className={[
        isDragging ? 'isDragging' : '',
        panelStuff.boundsHighlighted && isOnCorner ? 'isHighlighted' : '',
      ].join(' ')}
      style={{cursor: cursors[which]}}
    />
  )
}

export default PanelResizeHandle
