import type Sequence from '@theatre/core/sequences/Sequence'
import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import RoomToClick from '@theatre/studio/uiComponents/RoomToClick'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/shared/utils/react/useRefAndState'
import {usePrism} from '@theatre/dataverse-react'
import type {$IntentionalAny} from '@theatre/shared/utils/types'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import clamp from 'lodash-es/clamp'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'

const Container = styled.div<{isVisible: boolean}>`
  --thumbColor: #00e0ff;
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  z-index: ${() => zIndexes.seeker};
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
`

const Thumb = styled.div`
  background-color: var(--thumbColor);
  position: absolute;
  width: 5px;
  height: 13px;
  top: -4px;
  left: -2px;
  z-index: 11;
  cursor: ew-resize;
  pointer-events: auto;

  &:before {
    position: absolute;
    display: block;
    content: ' ';
    left: -2px;
    width: 0;
    height: 0;
    border-bottom: 4px solid #1f2b2b;
    border-left: 2px solid transparent;
  }

  &:after {
    position: absolute;
    display: block;
    content: ' ';
    right: -2px;
    width: 0;
    height: 0;
    border-bottom: 4px solid #1f2b2b;
    border-right: 2px solid transparent;
  }
`

const Squinch = styled.div`
  position: absolute;
  left: 1px;
  right: 1px;
  top: 13px;
  border-top: 3px solid var(--thumbColor);
  border-right: 1px solid transparent;
  border-left: 1px solid transparent;
  pointer-events: none;

  &:before {
    position: absolute;
    display: block;
    content: ' ';
    top: -4px;
    left: -2px;
    height: 8px;
    width: 2px;
    background: none;
    border-radius: 0 100% 0 0;
    border-top: 1px solid var(--thumbColor);
    border-right: 1px solid var(--thumbColor);
  }

  &:after {
    position: absolute;
    display: block;
    content: ' ';
    top: -4px;
    right: -2px;
    height: 8px;
    width: 2px;
    background: none;
    border-radius: 100% 0 0 0;
    border-top: 1px solid var(--thumbColor);
    border-left: 1px solid var(--thumbColor);
  }
`

const Tooltip = styled.div`
  display: none;
  position: absolute;
  top: -20px;
  left: 4px;
  padding: 0 2px;
  transform: translateX(-50%);
  background: #1a1a1a;
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  ${Thumb}:hover & {
    display: block;
  }
`

const Playhead: React.FC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const [thumbRef, thumbNode] = useRefAndState<HTMLElement | null>(null)

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    const setIsSeeking = val(layoutP.seeker.setIsSeeking)

    let posBeforeSeek = 0
    let sequence: Sequence
    let scaledSpaceToUnitSpace: typeof layoutP.scaledSpace.toUnitSpace.$$__pointer_type

    return {
      onDragStart() {
        sequence = val(layoutP.sheet).getSequence()
        posBeforeSeek = sequence.position
        scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)
        setIsSeeking(true)
      },
      onDrag(dx) {
        const deltaPos = scaledSpaceToUnitSpace(dx)
        const newPos = clamp(posBeforeSeek + deltaPos, 0, sequence.length)
        sequence.position = newPos
      },
      onDragEnd() {
        setIsSeeking(false)
      },
    }
  }, [])

  useDrag(thumbNode, gestureHandlers)

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

    return (
      <Container
        isVisible={isVisible}
        style={{transform: `translate3d(${posInClippedSpace}px, 0, 0)`}}
      >
        <Thumb ref={thumbRef as $IntentionalAny}>
          <RoomToClick room={4} />
          <Squinch />
          <Tooltip>
            {sequence.positionFormatter.formatForPlayhead(
              sequence.closestGridPosition(posInUnitSpace),
            )}
          </Tooltip>
        </Thumb>

        <Rod />
      </Container>
    )
  }, [layoutP])
}

export default Playhead
