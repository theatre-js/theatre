import type Sequence from '@theatre/core/sequences/Sequence'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import RoomToClick from '@theatre/studio/uiComponents/RoomToClick'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {usePrism, useVal} from '@theatre/react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import clamp from 'lodash-es/clamp'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {
  attributeNameThatLocksFramestamp,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import PlayheadPositionPopover from './PlayheadPositionPopover'
import {getIsPlayheadAttachedToFocusRange} from '@theatre/studio/UIRoot/useKeyboardShortcuts'

const Container = styled.div<{isVisible: boolean}>`
  --thumbColor: #00e0ff;
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  z-index: ${() => zIndexes.playhead};
  pointer-events: none;

  display: ${(props) => (props.isVisible ? 'block' : 'none')};
`

const Rod = styled.div`
  position: absolute;
  top: 8px;
  width: 0;
  height: calc(100% - 8px);
  border-left: 1px solid #27e0fd;
  z-index: 10;

  #pointer-root.draggingPositionInSequenceEditor &:not(.seeking) {
    pointer-events: auto;

    &:after {
      position: absolute;
      inset: -8px;
      display: block;
      content: ' ';
    }
  }
`

const Thumb = styled.div`
  position: absolute;
  width: 5px;
  height: 13px;
  top: -4px;
  left: -2px;
  z-index: 11;
  cursor: ew-resize;
  ${pointerEventsAutoInNormalMode};

  #pointer-root.draggingPositionInSequenceEditor &:not(.seeking) {
    pointer-events: auto;
  }
`

const Tooltip = styled.div`
  display: none;
  position: absolute;
  transform: translateX(-50%);
  background: #1a1a1a;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  ${Thumb}:hover &, ${Container}.seeking & {
    display: block;
  }
`

const RegularThumbSvg: React.FC = () => (
  <svg
    width="7"
    height="26"
    viewBox="0 0 7 26"
    xmlns="http://www.w3.org/2000/svg"
    style={{fill: '#00e0ff', marginLeft: '-1px'}}
  >
    <path d="M 0,0 L 7,0 L 7,13 C 4,15 4,26 4,26 L 3,26 C 3,26 3,15 0,13 L 0,0 Z" />
  </svg>
)

const LargeThumbSvg: React.FC = () => (
  <svg
    width="9"
    height="37"
    viewBox="0 0 9 37"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      fill: '#00e0ff',
      marginLeft: '-2px',
      marginTop: '-4px',
    }}
  >
    <path d="M 0,0 L 9,0 L 9,18 C 5,20 5,37 5,37 L 4,37 C 4,37 4,20 0,18 L 0,0 Z" />
  </svg>
)

const Playhead: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const [thumbRef, thumbNode] = useRefAndState<HTMLElement | null>(null)

  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    {},
    () => {
      return (
        <BasicPopover>
          <PlayheadPositionPopover
            layoutP={layoutP}
            onRequestClose={closePopover}
          />
        </BasicPopover>
      )
    },
  )

  const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    const setIsSeeking = val(layoutP.seeker.setIsSeeking)

    let posBeforeSeek = 0
    let sequence: Sequence

    return {
      onDragStart() {
        sequence = val(layoutP.sheet).getSequence()
        posBeforeSeek = sequence.position
        setIsSeeking(true)
      },
      onDrag(dx, _, event) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const unsnappedPos = clamp(posBeforeSeek + deltaPos, 0, sequence.length)

        let newPosition = unsnappedPos

        const snapTarget = event
          .composedPath()
          .find(
            (el): el is Element =>
              el instanceof Element &&
              el !== thumbNode &&
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
      onDragEnd() {
        setIsSeeking(false)
      },
      lockCursorTo: 'ew-resize',
    }
  }, [scaledSpaceToUnitSpace])

  useDrag(thumbNode, gestureHandlers)

  // hide the frame stamp when seeking
  useLockFrameStampPosition(useVal(layoutP.seeker.isSeeking), -1)

  return usePrism(() => {
    const isSeeking = val(layoutP.seeker.isSeeking)

    const sequence = val(layoutP.sheet).getSequence()

    const posInUnitSpace = sequence.positionDerivation.getValue()

    const posInClippedSpace = val(layoutP.clippedSpace.fromUnitSpace)(
      posInUnitSpace,
    )
    const isVisible =
      posInClippedSpace >= 0 &&
      posInClippedSpace <= val(layoutP.clippedSpace.width)

    const isPlayheadAttachedToFocusRange = val(
      getIsPlayheadAttachedToFocusRange(sequence),
    )

    return (
      <>
        {popoverNode}
        <Container
          isVisible={isVisible}
          style={{transform: `translate3d(${posInClippedSpace}px, 0, 0)`}}
          className={isSeeking ? 'seeking' : ''}
          {...{[attributeNameThatLocksFramestamp]: 'hide'}}
        >
          <Thumb
            ref={thumbRef as $IntentionalAny}
            data-pos={posInUnitSpace.toFixed(3)}
          >
            <RoomToClick room={8} />
            {isPlayheadAttachedToFocusRange ? (
              <LargeThumbSvg />
            ) : (
              <RegularThumbSvg />
            )}
            <Tooltip
              style={{top: isPlayheadAttachedToFocusRange ? '-23px' : '-18px'}}
            >
              {sequence.positionFormatter.formatForPlayhead(
                sequence.closestGridPosition(posInUnitSpace),
              )}
            </Tooltip>
          </Thumb>

          <Rod
            data-pos={posInUnitSpace.toFixed(3)}
            className={isSeeking ? 'seeking' : ''}
          />
        </Container>
      </>
    )
  }, [layoutP, thumbRef, popoverNode])
}

export default Playhead
