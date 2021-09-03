import type Sequence from '@theatre/core/sequences/Sequence'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {usePrism} from '@theatre/dataverse-react'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import {clamp, mapValues} from 'lodash-es'
import React, {useLayoutEffect, useMemo} from 'react'
import styled from 'styled-components'
import {useReceiveVerticalWheelEvent} from '@theatre/studio/panels/SequenceEditorPanel/VerticalScrollContainer'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import {useCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'

const Container = styled.div`
  position: absolute;

  right: 0;
  overflow-x: scroll;
  overflow-y: hidden;
  ${pointerEventsAutoInNormalMode};

  // hide the scrollbar on Gecko
  scrollbar-width: none;

  // hide the scrollbar on Webkit/Blink
  &::-webkit-scrollbar {
    display: none;
  }
`

const ShiftRight = styled.div`
  position: absolute;
`

const HorizontallyScrollableArea: React.FC<{
  layoutP: Pointer<SequenceEditorPanelLayout>
  height: number
}> = React.memo(({layoutP, children, height}) => {
  const {width, unitSpaceToScaledSpaceMultiplier} = usePrism(
    () => ({
      width: val(layoutP.rightDims.width),
      unitSpaceToScaledSpaceMultiplier: val(layoutP.scaledSpace.fromUnitSpace)(
        1,
      ),
    }),
    [layoutP],
  )

  const [containerRef, containerNode] = useRefAndState<HTMLDivElement | null>(
    null,
  )

  useHandlePanAndZoom(layoutP, containerNode)
  useDragHandlers(layoutP, containerNode)
  useUpdateScrollFromClippedSpaceRange(layoutP, containerNode)

  return (
    <Container
      ref={containerRef}
      style={{
        width: width + 'px',
        height: height + 'px',
        // @ts-expect-error
        '--unitSpaceToScaledSpaceMultiplier': unitSpaceToScaledSpaceMultiplier,
      }}
    >
      <ShiftRight
        style={{
          left: val(layoutP.scaledSpace.leftPadding) + 'px',
        }}
      >
        {children}
      </ShiftRight>
    </Container>
  )
})

export default HorizontallyScrollableArea

function useDragHandlers(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  containerEl: HTMLDivElement | null,
) {
  const handlers = useMemo((): Parameters<typeof useDrag>[1] => {
    let posBeforeSeek = 0
    let sequence: Sequence
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type
    const setIsSeeking = val(layoutP.seeker.setIsSeeking)

    return {
      onDrag(dx: number, _, event) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const unsnappedPos = clamp(posBeforeSeek + deltaPos, 0, sequence.length)

        let newPosition = unsnappedPos

        const snapTarget = event.composedPath().find(
          (el): el is Element =>
            el instanceof Element &&
            // el !== thumbNode &&
            el.hasAttribute('data-pos'),
        )

        if (snapTarget) {
          const snapPos = parseFloat(snapTarget.getAttribute('data-pos')!)

          if (isFinite(snapPos)) {
            newPosition = snapPos
          }
        }

        sequence.position = newPosition
      },
      onDragStart(event) {
        if (event.target instanceof HTMLInputElement) return false
        if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
          return false
        }
        if (
          event
            .composedPath()
            .some((el) => el instanceof HTMLElement && el.draggable === true)
        ) {
          return false
        }

        const initialPositionInClippedSpace =
          event.clientX - containerEl!.getBoundingClientRect().left

        const initialPositionInUnitSpace = clamp(
          val(layoutP.clippedSpace.toUnitSpace)(initialPositionInClippedSpace),
          0,
          Infinity,
        )

        sequence = val(layoutP.sheet).getSequence()

        sequence.position = initialPositionInUnitSpace

        posBeforeSeek = initialPositionInUnitSpace
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        setIsSeeking(true)
      },
      onDragEnd() {
        setIsSeeking(false)
      },
    }
  }, [layoutP, containerEl])

  const [isDragigng] = useDrag(containerEl, handlers)

  useCursorLock(isDragigng, 'draggingPositionInSequenceEditor', 'ew-resize')
}

function useHandlePanAndZoom(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  node: HTMLDivElement | null,
) {
  const receiveVerticalWheelEvent = useReceiveVerticalWheelEvent()
  useLayoutEffect(() => {
    if (!node) return

    const receiveWheelEvent = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
        // receiveVerticalWheelEvent(event)
        event.preventDefault()
        event.stopPropagation()

        const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        const deltaPos = scaledSpaceToUnitSpace(event.deltaX * 1)
        const oldRange = val(layoutP.clippedSpace.range)
        const newRange = mapValues(oldRange, (p) => p + deltaPos)

        const setRange = val(layoutP.clippedSpace.setRange)

        setRange(newRange)

        return
      }

      // pinch
      if (event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()

        const pivotPointInClippedSpace =
          event.clientX - node.getBoundingClientRect().left

        const pivotPointInUnitSpace = val(layoutP.clippedSpace.toUnitSpace)(
          pivotPointInClippedSpace,
        )

        const oldRange = val(layoutP.clippedSpace.range)
        const scaleFactor = 1 + event.deltaY * 0.03

        const newRange = mapValues(oldRange, (originalPos) => {
          return (
            (originalPos - pivotPointInUnitSpace) * scaleFactor +
            pivotPointInUnitSpace
          )
        })

        val(layoutP.clippedSpace.setRange)(newRange)
      }
    }

    const listenerOptions = {
      capture: true,
      passive: false,
    }
    node.addEventListener('wheel', receiveWheelEvent, listenerOptions)

    return () => {
      node.removeEventListener('wheel', receiveWheelEvent, listenerOptions)
    }
  }, [node, layoutP])
}

function useUpdateScrollFromClippedSpaceRange(
  layoutP: Pointer<SequenceEditorPanelLayout>,
  node: HTMLDivElement | null,
) {
  useLayoutEffect(() => {
    if (!node) return

    const d = prism(() => {
      const range = val(layoutP.clippedSpace.range)
      const rangeStartInScaledSpace = val(layoutP.scaledSpace.fromUnitSpace)(
        range.start,
      )

      return rangeStartInScaledSpace
    })

    const update = () => {
      const rangeStartInScaledSpace = d.getValue()
      node.scrollLeft = rangeStartInScaledSpace
    }
    const untap = d.changesWithoutValues().tap(update)

    update()
    const timeout = setTimeout(update, 100)

    return () => {
      clearTimeout(timeout)
      untap()
    }
  }, [layoutP, node])
}
