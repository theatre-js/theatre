import useOnKeyDown from '@theatre/studio/uiComponents/useOnKeyDown'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@theatre/dataverse'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import React, {useMemo, useState} from 'react'
import {usePrism} from '@theatre/react'
import {val} from '@theatre/dataverse'
import styled from 'styled-components'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import {clamp} from 'lodash-es'

const RangeStart = styled.div`
  background-color: blue;
  width: 20px;
  left: -20px;
  height: 100%;
  position: absolute;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const RangeEnd = styled.div`
  background-color: green;
  width: 20px;
  height: 100%;
  position: absolute;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};
`

const FocusRange: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  className: string
}> = ({layoutP, className}) => {
  const [startRef, startNode] = useRefAndState<HTMLElement | null>(null)
  const [endRef, endNode] = useRefAndState<HTMLElement | null>(null)
  const [startPosition, setStartPosition] = useState(0)
  const [endPosition, setEndPosition] = useState(1)
  let sequence = val(layoutP.sheet).getSequence()

  const startGestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    // let sequence: Sequence
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    let posBeforeDrag = startPosition

    return {
      onDragStart() {
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag = startPosition
        // position before drag
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, _, event) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition = clamp(posBeforeDrag + deltaPos, 0, sequence.length)
        // startPosInClippedSpace = newPosition
        window.startPos = newPosition
        setStartPosition(newPosition)
      },
      onDragEnd() {},
      lockCursorTo: 'ew-resize',
    }
  }, [])

  const endGestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    // let sequence: Sequence
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    let posBeforeDrag = endPosition

    return {
      onDragStart() {
        sequence = val(layoutP.sheet).getSequence()
        posBeforeDrag = endPosition
        // position before drag
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        console.log('drag start')
      },
      onDrag(dx, _, event) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPosition = clamp(posBeforeDrag + deltaPos, 0, sequence.length)
        // endPosInClippedSpace = newPosition
        setEndPosition(newPosition)
        window.endPos = newPosition
        console.log('being dragged')
      },
      onDragEnd() {
        console.log('drag end')
      },
      lockCursorTo: 'ew-resize',
    }
  }, [])

  useDrag(startNode, startGestureHandlers)
  useDrag(endNode, endGestureHandlers)

  useOnKeyDown(
    (ev) => {
      if (ev.code === 'Space') {
        if (sequence.playing) {
          sequence.pause()
        } else {
          sequence.play({
            range: [window.startPos || 0, window.endPos || sequence.length],
            iterationCount: Infinity,
          })
        }
        ev.stopImmediatePropagation()
      }
    },
    [startPosition, endPosition],
  )

  return usePrism(() => {
    // const sheet = val(layoutP.sheet)
    // const sequence = sheet.getSequence()
    // const sequenceLength = sequence.length
    // const posInUnitSpace = sequenceLength
    const startPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      startPosition,
    )
    const endPosInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      endPosition,
    )

    let width = val(layoutP.clippedSpace.fromUnitSpace)(
      endPosition - startPosition,
    )

    return (
      <div
        className={className}
        style={{
          width: `${width}px`,
        }}
      >
        <RangeStart
          ref={startRef as $IntentionalAny}
          onClick={() => alert('clicked')}
          style={{transform: `translate3d(${startPosInClippedSpace}px, 0, 0)`}}
        />
        <RangeEnd
          ref={endRef as $IntentionalAny}
          onClick={() => alert('clicked')}
          style={{transform: `translate3d(${endPosInClippedSpace}px, 0, 0)`}}
        />
      </div>
    )
  }, [layoutP, startRef, endRef, startPosition, endPosition])
}

export default FocusRange
