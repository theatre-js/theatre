import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import getStudio from '@theatre/studio/getStudio'
import type Sheet from '@theatre/core/sheets/Sheet'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import {
  attributeNameThatLocksFramestamp,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

const coverWidth = 1000

const colors = {
  stripNormal: `#0000006c`,
  stripActive: `#000000`,
}

const Strip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  z-index: ${() => zIndexes.lengthIndicatorStrip};
  pointer-events: none;

  &:after {
    display: block;
    content: ' ';
    position: absolute;
    /* top: ${topStripHeight}px; */
    top: 0;
    bottom: 0;
    left: -1px;
    width: 1px;
    background-color: ${colors.stripNormal};
  }

  &:hover:after,
  &.dragging:after {
    background-color: ${colors.stripActive};
  }
`

const Bulge = styled.div`
  position: absolute;
  top: ${topStripHeight + 4}px;
  font-size: 10px;
  left: 0px;
  white-space: nowrap;
  padding: 2px 8px 2px 8px;
  border-radius: 0 2px 2px 0;
  pointer-events: auto;
  cursor: ew-resize;
  color: #555;
  color: #464646;
  background-color: #0000004d;

  ${Strip}:hover &, ${Strip}.dragging & {
    color: white;
    background-color: ${colors.stripActive};
  }
`

const Cover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgb(23 23 23 / 43%);
  width: ${coverWidth}px;
  z-index: ${() => zIndexes.lengthIndicatorCover};
  transform-origin: left top;

  ${Strip}.dragging ~ &, ${Strip}:hover ~ & {
    background-color: rgb(23 23 23 / 60%);
  }
`

type IProps = {
  layoutP: Pointer<SequenceEditorPanelLayout>
}

const LengthIndicator: React.FC<IProps> = ({layoutP}) => {
  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)
  const [isDraggingD] = useDragBulge(node, {layoutP})
  const [popoverNode, openPopover, _, isPopoverOpen] = usePopover(() => {
    return <div>poppio</div>
  })

  return usePrism(() => {
    const sheet = val(layoutP.sheet)
    const height = val(layoutP.rightDims.height)

    const sequence = sheet.getSequence()
    const sequenceLength = sequence.length
    const startInUnitSpace = sequenceLength

    let startX = val(layoutP.clippedSpace.fromUnitSpace)(startInUnitSpace)
    let endX = val(layoutP.clippedSpace.width)
    let scaleX: number, translateX: number
    if (startX > endX) {
      translateX = 0
      scaleX = 0
    } else {
      if (startX < 0) {
        startX = 0
      }
      translateX = startX
      scaleX = (endX - startX) / coverWidth
    }

    return (
      <>
        {popoverNode}
        <Strip
          title="Change Sequence Length"
          style={{
            height: height + 'px',
            transform: `translateX(${translateX === 0 ? -1000 : translateX}px)`,
          }}
          className={val(isDraggingD) ? 'dragging' : ''}
        >
          <Bulge
            ref={nodeRef}
            title="Length of the sequence (sequence.length)"
            onClick={(e) => {
              openPopover(e, node!)
            }}
            {...{[attributeNameThatLocksFramestamp]: 'hide'}}
          >
            {sequence.positionFormatter.formatForPlayhead(sequenceLength)}
          </Bulge>
        </Strip>
        <Cover
          title="Length"
          // onClick={() => {
          //   getStudio()!.transaction(({stateEditors}) => {
          //     stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
          //       ...sheet.address,
          //       length: 10,
          //     })
          //   })
          // }}
          style={{
            height: height + 'px',
            transform: `translateX(${translateX}px) scale(${scaleX}, 1)`,
          }}
        />
      </>
    )
  }, [layoutP, nodeRef, isDraggingD, popoverNode])
}

function useDragBulge(node: HTMLDivElement | null, props: IProps) {
  const propsRef = useRef(props)
  propsRef.current = props
  const [isDragging, setIsDragging] = useState(false)

  useLockFrameStampPosition(isDragging, -1)

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps
    let sheet: Sheet
    let initialLength: number

    return {
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        setIsDragging(true)
        propsAtStartOfDrag = propsRef.current
        sheet = val(propsRef.current.layoutP.sheet)
        initialLength = sheet.getSequence().length

        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, dy, event) {
        const delta = toUnitSpace(dx)
        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.setLength({
            ...sheet.address,
            length: initialLength + delta,
          })
        })
      },
      onDragEnd(dragHappened) {
        setIsDragging(false)
        if (dragHappened) {
          if (tempTransaction) {
            tempTransaction.commit()
          }
        } else {
          if (tempTransaction) {
            tempTransaction.discard()
          }
        }
        tempTransaction = undefined
      },
    }
  }, [])

  useDrag(node, gestureHandlers)

  return [isDragging]
}

export default LengthIndicator
