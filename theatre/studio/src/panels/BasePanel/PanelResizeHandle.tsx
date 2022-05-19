import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import {lighten} from 'polished'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import {panelDimsToPanelPosition, usePanel} from './BasePanel'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'

const Base = styled.div`
  position: absolute;
  ${pointerEventsAutoInNormalMode};
  &:after {
    position: absolute;
    inset: -5px;
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

const Side = styled(Base)`
  /**
  The horizintal/vertical resize handles have z-index:-1 and are offset 1px outside of the panel
  to make sure they don't occlude any element that pops out of the panel (like the Playhead in SequenceEditorPanel).

  This means that panels will always need an extra 1px margin for their resize handles to be visible, but that's not a problem
  that we have to deal with right now (if it is at all a problem).
  
   */
  z-index: -1;
`

const Horizontal = styled(Side)`
  left: 0px;
  right: 0px;
  height: 1px;
`

const Top = styled(Horizontal)`
  top: -1px;
`

const Bottom = styled(Horizontal)`
  bottom: -1px;
`

const Vertical = styled(Side)`
  z-index: -1;
  top: -1px;
  bottom: -1px;
  width: 1px;
`

const Left = styled(Vertical)`
  left: -1px;
`

const Right = styled(Vertical)`
  right: -1px;
`

const Angle = styled(Base)`
  // The angles have z-index: 10 to make sure they _do_ occlude other elements in the panel.
  z-index: 10;
  width: 8px;
  height: 8px;
`

const TopLeft = styled(Angle)`
  top: 0;
  left: 0;
`

const TopRight = styled(Angle)`
  top: 0;
  right: 0;
`

const BottomLeft = styled(Angle)`
  bottom: 0;
  left: 0;
`

const BottomRight = styled(Angle)`
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

  const [ref, node] = useRefAndState<HTMLDivElement>(null as $IntentionalAny)
  const dragOpts: Parameters<typeof useDrag>[1] = useMemo(() => {
    return {
      debugName: 'PanelResizeHandle',
      lockCursorTo: cursors[which],
      onDragStart() {
        let tempTransaction: CommitOrDiscard | undefined

        const stuffBeforeDrag = panelStuffRef.current
        const unlock = panelStuff.addBoundsHighlightLock()

        return {
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
            unlock()
            if (dragHappened) {
              tempTransaction?.commit()
            } else {
              tempTransaction?.discard()
            }
          },
        }
      },
    }
  }, [which])

  const [isDragging] = useDrag(node, dragOpts)
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
