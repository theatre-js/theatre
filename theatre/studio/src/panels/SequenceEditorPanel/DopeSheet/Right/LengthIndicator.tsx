import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {Box} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {topStripHeight} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/TopStrip'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import getStudio from '@theatre/studio/getStudio'
import type Sheet from '@theatre/core/sheets/Sheet'

const coverWidth = 1000

const Strip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  z-index: ${() => zIndexes.lengthIndicatorStrip};
  pointer-events: auto;
  cursor: ew-resize;

  &:after {
    display: block;
    content: ' ';
    position: absolute;
    top: ${topStripHeight}px;
    bottom: 0;
    left: -1px;
    width: 1px;
    background-color: #000000a6;
  }

  &:hover:after,
  &.dragging:after {
    background-color: #000000;
  }
`

const Info = styled.div`
  position: absolute;
  top: ${topStripHeight + 4}px;
  font-size: 10px;
  left: 4px;
  color: #eee;
  white-space: nowrap;
  display: none;

  ${Strip}:hover &, ${Strip}.dragging & {
    display: block;
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

  ${Strip}:hover ~ &, ${Strip}.dragging ~ & {
    background-color: rgb(23 23 23 / 60%);
  }
`

type IProps = {
  layoutP: Pointer<SequenceEditorPanelLayout>
}

const LengthIndicator: React.FC<IProps> = ({layoutP}) => {
  const [stripRef, stripNode] = useRefAndState<HTMLDivElement | null>(null)
  const [isDraggingD] = useDragStrip(stripNode, {layoutP})

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
        <Strip
          title="Change Sequence Length"
          ref={stripRef}
          style={{
            height: height + 'px',
            transform: `translateX(${translateX === 0 ? -1000 : translateX}px)`,
          }}
          className={val(isDraggingD) ? 'dragging' : ''}
        >
          <Info>
            sequence.length:{' '}
            {sequence.positionFormatter.formatForPlayhead(sequenceLength)}
          </Info>
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
  }, [layoutP, stripRef, isDraggingD])
}

function useDragStrip(node: HTMLDivElement | null, props: IProps) {
  const propsRef = useRef(props)
  propsRef.current = props
  const isDragging = useMemo(() => new Box(false), [])

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps
    let sheet: Sheet
    let initialLength: number

    return {
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        propsAtStartOfDrag = propsRef.current
        sheet = val(propsRef.current.layoutP.sheet)
        initialLength = sheet.getSequence().length

        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
        isDragging.set(true)
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
        isDragging.set(false)
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

  return [isDragging.derivation]
}

export default LengthIndicator
