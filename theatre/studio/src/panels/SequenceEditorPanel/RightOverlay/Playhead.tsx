import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import RoomToClick from '@theatre/studio/uiComponents/RoomToClick'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {usePrism, useVal} from '@theatre/react'
import type {Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import clamp from 'lodash-es/clamp'
import React, {useMemo} from 'react'
import styled from 'styled-components'
import {zIndexes} from '@theatre/studio/panels/SequenceEditorPanel/SequenceEditorPanel'
import {
  includeLockFrameStampAttrs,
  useLockFrameStampPosition,
} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {pointerEventsAutoInNormalMode} from '@theatre/studio/css'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import PlayheadPositionPopover from './PlayheadPositionPopover'
import {getIsPlayheadAttachedToFocusRange} from '@theatre/studio/UIRoot/getIsPlayheadAttachedToFocusRange'
import {
  lockedCursorCssVarName,
  useCssCursorLock,
} from '@theatre/studio/uiComponents/PointerEventsHandler'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import getStudio from '@theatre/studio/getStudio'
import {generateSequenceMarkerId} from '@theatre/shared/utils/ids'
import DopeSnap from './DopeSnap'
import {
  snapToAll,
  snapToNone,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/KeyframeSnapTarget'
import {prismRender} from '@theatre/studio/utils/derive-utils'
import studioTicker from '@theatre/studio/studioTicker'
import {useElementMutation} from '@theatre/studio/uiComponents/useElementMutation'

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
  transform: translate3d(var(--playhead-pos, 0), 0, 0);
`

const Rod = styled.div`
  position: absolute;
  top: 8px;
  width: 0;
  height: calc(100% - 8px);
  border-left: 1px solid #27e0fd;
  z-index: 10;
  pointer-events: none;

  #pointer-root.draggingPositionInSequenceEditor &:not(.seeking) {
    /* pointer-events: auto; */
    /* cursor: var(${lockedCursorCssVarName}); */

    &:after {
      position: absolute;
      inset: -8px;
      display: block;
      content: ' ';
    }
  }
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
  --sunblock-color: #1f2b2b;

  ${pointerEventsAutoInNormalMode};

  ${Container}.seeking > & {
    pointer-events: none !important;
  }

  #pointer-root.draggingPositionInSequenceEditor
    ${Container}:not(.seeking)
    > & {
    pointer-events: auto;
    cursor: var(${lockedCursorCssVarName});
  }

  ${Container}.playheadattachedtofocusrange > & {
    top: -8px;
    --sunblock-color: #005662;
    &:before,
    &:after {
      border-bottom-width: 8px;
    }
  }

  &:before {
    position: absolute;
    display: block;
    content: ' ';
    left: -2px;
    width: 0;
    height: 0;
    border-bottom: 4px solid var(--sunblock-color);
    border-left: 2px solid transparent;
  }

  &:after {
    position: absolute;
    display: block;
    content: ' ';
    right: -2px;
    width: 0;
    height: 0;
    border-bottom: 4px solid var(--sunblock-color);
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

  /* ${Container}.playheadattachedtofocusrange & {
    top: 10px;
    &:before,
    &:after {
      height: 15px;
    }
  } */

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

  ::before {
    content: attr(data-display);
  }

  ${Thumb}:hover &, ${Container}.seeking & {
    display: block;
  }
`

const Playhead: React.VFC<{layoutP: Pointer<SequenceEditorPanelLayout>}> = ({
  layoutP,
}) => {
  const [thumbRef, thumbNode] = useRefAndState<HTMLDivElement | null>(null)

  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    {debugName: 'Playhead'},
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

  const gestureHandlers = useMemo((): Parameters<typeof useDrag>[1] => {
    return {
      debugName: 'RightOverlay/Playhead',
      onDragStart() {
        const sequence = val(layoutP.sheet).getSequence()
        const posBeforeSeek = sequence.position
        const scaledSpaceToUnitSpace = val(layoutP.scaledSpace.toUnitSpace)

        const setIsSeeking = val(layoutP.seeker.setIsSeeking)
        setIsSeeking(true)

        snapToAll()

        return {
          onDrag(dx, _, event) {
            const deltaPos = scaledSpaceToUnitSpace(dx)

            sequence.position =
              DopeSnap.checkIfMouseEventSnapToPos(event, {
                ignore: thumbNode,
              }) ??
              // unsnapped
              clamp(posBeforeSeek + deltaPos, 0, sequence.length)
          },
          onDragEnd(dragHappened) {
            setIsSeeking(false)
            snapToNone()
          },
          onClick(e) {
            openPopover(e, thumbRef.current!)
          },
        }
      },
    }
  }, [layoutP, thumbNode])

  const [isDragging] = useDrag(thumbNode, gestureHandlers)

  useCssCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  // hide the frame stamp when seeking
  useLockFrameStampPosition(useVal(layoutP.seeker.isSeeking) || isDragging, -1)

  const [contextMenu] = usePlayheadContextMenu(thumbNode, {
    // pass in a pointer to ensure we aren't spending retrieval on every render
    layoutP,
  })

  const sequence = usePrism(() => val(layoutP.sheet).getSequence(), [layoutP])
  const dvs = useMemo(() => {
    const stateD = prism(() => ({
      isSeeking: val(layoutP.seeker.isSeeking),
      isPlayheadAttachedToFocusRange: val(
        getIsPlayheadAttachedToFocusRange(sequence),
      ),
    }))

    const posInUnitSpaceD = sequence.positionDerivation

    const posInClippedSpaceD = prism(() => {
      return val(layoutP.clippedSpace.fromUnitSpace)(posInUnitSpaceD.getValue())
    })

    const isVisibleD = prism(() => {
      const posInClippedSpace = val(posInClippedSpaceD)
      const isVisible =
        posInClippedSpace >= 0 &&
        posInClippedSpace <= val(layoutP.clippedSpace.width)
      return isVisible
    })

    return {stateD, isVisibleD, posInClippedSpaceD, posInUnitSpaceD}
  }, [layoutP, sequence, thumbRef, popoverNode])

  const tooltip = prismRender(
    () =>
      sequence.positionFormatter.formatForPlayhead(
        sequence.closestGridPosition(dvs.posInUnitSpaceD.getValue()),
      ),
    [sequence, dvs.posInUnitSpaceD],
  )

  // broken out into refs to reduce memory allocations by direct assigning to the elements
  // fixing https://linear.app/theatre/issue/P-268/fix-the-memory-leak
  const containerRef = useElementMutation<HTMLDivElement>((container) => {
    return dvs.posInClippedSpaceD.tapImmediate(
      studioTicker,
      (posInClippedSpace) => {
        container.style.setProperty('--playhead-pos', `${posInClippedSpace}px`)
      },
    )
  })

  const tooltipRef = useElementMutation<HTMLDivElement>((container) => {
    return dvs.posInUnitSpaceD.tapImmediate(studioTicker, (posInUnitSpace) => {
      const gridPos = sequence.positionFormatter.formatForPlayhead(
        sequence.closestGridPosition(posInUnitSpace),
      )
      container.dataset.display = gridPos
    })
  })

  const rodRef = useElementMutation<HTMLDivElement>((rod) => {
    return dvs.posInUnitSpaceD.tapImmediate(studioTicker, (posInUnitSpace) => {
      DopeSnap.setPositionSnapAttrs(rod, posInUnitSpace)
    })
  })

  const container = prismRender(() => {
    const {isSeeking, isPlayheadAttachedToFocusRange} = dvs.stateD.getValue()
    return (
      <Container
        isVisible={dvs.isVisibleD.getValue()}
        className={`${isSeeking && 'seeking'} ${
          isPlayheadAttachedToFocusRange && 'playheadattachedtofocusrange'
        }`}
        {...includeLockFrameStampAttrs('hide')}
        ref={containerRef}
      >
        <Thumb ref={thumbRef}>
          <RoomToClick room={8} />
          <Squinch />
          <Tooltip ref={tooltipRef} />
        </Thumb>
        <Rod ref={rodRef} className={isSeeking ? 'seeking' : ''} />
      </Container>
    )
  }, [dvs, tooltip])

  return (
    <>
      {contextMenu}
      {popoverNode}
      {container}
    </>
  )
}

export default Playhead

function usePlayheadContextMenu(
  node: HTMLElement | null,
  options: {layoutP: Pointer<SequenceEditorPanelLayout>},
) {
  return useContextMenu(node, {
    menuItems() {
      return [
        {
          label: 'Place marker',
          callback: () => {
            getStudio().transaction(({stateEditors}) => {
              // only retrieve val on callback to reduce unnecessary work on every use
              const sheet = val(options.layoutP.sheet)
              const sheetSequence = sheet.getSequence()
              stateEditors.studio.historic.projects.stateByProjectId.stateBySheetId.sequenceEditor.replaceMarkers(
                {
                  sheetAddress: sheet.address,
                  markers: [
                    {
                      id: generateSequenceMarkerId(),
                      position: sheetSequence.position,
                    },
                  ],
                  snappingFunction: sheetSequence.closestGridPosition,
                },
              )
            })
          },
        },
      ]
    },
  })
}
