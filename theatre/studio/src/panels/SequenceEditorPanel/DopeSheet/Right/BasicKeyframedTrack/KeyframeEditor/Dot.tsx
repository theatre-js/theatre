import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {lighten} from 'polished'
import React, {useMemo, useEffect, useRef, useState} from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {attributeNameThatLocksFramestamp} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {useCursorLock} from '@theatre/studio/uiComponents/PointerEventsHandler'
import SnapCursor from './SnapCursor.svg'
import {getContextMenuItemForCopyKeyframes} from '@theatre/studio/uiComponents/simpleContextMenu/getCopyPasteKeyframesItem'
import {useTrackHighlightProvider} from '@theatre/studio/panels/SequenceEditorPanel/TrackHighlightProvider'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'

export const dotSize = 6
const hitZoneSize = 12
const snapCursorSize = 34

const dims = (size: number) => `
  left: ${-size / 2}px;
  top: ${-size / 2}px;
  width: ${size}px;
  height: ${size}px;
`

const dotTheme = {
  normalColor: '#40AAA4',
  get selectedColor() {
    return lighten(0.35, dotTheme.normalColor)
  },
}

const Square = styled.div<{isSelected: boolean}>`
  position: absolute;
  background: ${(props) =>
    props.isSelected ? dotTheme.selectedColor : dotTheme.normalColor};
  transform: rotateZ(45deg);

  z-index: 1;
  pointer-events: none;
  ${(props) => dims(props.isSelected ? dotSize : dotSize)}
`

const HitZone = styled.div`
  position: absolute;
  ${dims(hitZoneSize)};

  z-index: 1;

  cursor: ew-resize;

  #pointer-root.draggingPositionInSequenceEditor & {
    pointer-events: auto;
    &:hover:after {
      position: absolute;
      top: calc(50% - ${snapCursorSize / 2}px);
      left: calc(50% - ${snapCursorSize / 2}px);
      width: ${snapCursorSize}px;
      height: ${snapCursorSize}px;
      display: block;
      content: ' ';
      background: url(${SnapCursor}) no-repeat 100% 100%;
      // This icon might also fit: GiConvergenceTarget
    }
  }

  &.beingDragged {
    pointer-events: none !important;
  }

  &:hover + ${Square}, &.beingDragged + ${Square} {
    ${dims(dotSize + 5)}
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const Dot: React.FC<IProps> = (props) => {
  const {trackId} = props.leaf
  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu, , isOpen] = useKeyframeContextMenu(node, props)
  const [isDragging] = useDragKeyframe(node, props)

  const {setTrackToHighlightId} = useTrackHighlightProvider()

  // TODO: avoid race condition
  // see: https://github.com/theatre-js/theatre/blob/main/theatre/studio/src/uiComponents/useLockSet.ts
  useEffect(() => {
    if (trackId && isOpen) {
      setTrackToHighlightId(trackId)
    } else {
      setTrackToHighlightId(undefined)
    }
  }, [trackId, isOpen])

  return (
    <>
      <HitZone
        ref={ref}
        data-pos={props.keyframe.position.toFixed(3)}
        {...{
          [attributeNameThatLocksFramestamp]:
            props.keyframe.position.toFixed(3),
        }}
        className={isDragging ? 'beingDragged' : ''}
      />
      <Square isSelected={!!props.selection} />
      {contextMenu}
    </>
  )
}

export default Dot

function useKeyframeContextMenu(node: HTMLDivElement | null, props: IProps) {
  const {leaf, selection, keyframe} = props
  const copyKeyframesItem = useMemo(
    () => getContextMenuItemForCopyKeyframes({leaf, selection, keyframe}),
    [leaf, selection, keyframe],
  )

  return useContextMenu(node, {
    items: () => {
      const items: IContextMenuItem[] = [
        {
          label: props.selection ? 'Delete Selection' : 'Delete Keyframe',
          callback: () => {
            if (props.selection) {
              props.selection.delete()
            } else {
              getStudio()!.transaction(({stateEditors}) => {
                stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                  {
                    ...props.leaf.sheetObject.address,
                    keyframeIds: [props.keyframe.id],
                    trackId: props.leaf.trackId,
                  },
                )
              })
            }
          },
        },
      ]

      if (copyKeyframesItem) {
        items.unshift(copyKeyframesItem)
      }

      return items
    },
  })
}

function useDragKeyframe(
  node: HTMLDivElement | null,
  props: IProps,
): [isDragging: boolean] {
  const [isDragging, setIsDragging] = useState(false)
  useLockFrameStampPosition(isDragging, props.keyframe.position)

  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps
    let startingLayout: SequenceEditorPanelLayout

    let selectionDragHandlers:
      | ReturnType<DopeSheetSelection['getDragHandlers']>
      | undefined

    return {
      onDragStart(event) {
        setIsDragging(true)
        const props = propsRef.current
        if (props.selection) {
          const {selection, leaf} = props
          const {sheetObject} = leaf
          selectionDragHandlers = selection.getDragHandlers({
            ...sheetObject.address,
            pathToProp: leaf.pathToProp,
            trackId: leaf.trackId,
            keyframeId: props.keyframe.id,
            domNode: node!,
            positionAtStartOfDrag:
              props.trackData.keyframes[props.index].position,
          })
          selectionDragHandlers.onDragStart?.(event)
          return
        }

        propsAtStartOfDrag = props
        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, dy, event) {
        if (selectionDragHandlers) {
          selectionDragHandlers.onDrag(dx, dy, event)
          return
        }

        const original =
          propsAtStartOfDrag.trackData.keyframes[propsAtStartOfDrag.index]
        const deltaPos = toUnitSpace(dx)
        const newPosBeforeSnapping = Math.max(original.position + deltaPos, 0)

        let newPosition = newPosBeforeSnapping

        const snapTarget = event
          .composedPath()
          .find(
            (el): el is Element =>
              el instanceof Element &&
              el !== node &&
              el.hasAttribute('data-pos'),
          )

        if (snapTarget) {
          const snapPos = parseFloat(snapTarget.getAttribute('data-pos')!)
          if (isFinite(snapPos)) {
            newPosition = snapPos
          }
        }

        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.replaceKeyframes(
            {
              ...propsAtStartOfDrag.leaf.sheetObject.address,
              trackId: propsAtStartOfDrag.leaf.trackId,
              keyframes: [{...original, position: newPosition}],
              snappingFunction: val(
                propsAtStartOfDrag.layoutP.sheet,
              ).getSequence().closestGridPosition,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
        setIsDragging(false)

        if (selectionDragHandlers) {
          selectionDragHandlers.onDragEnd?.(dragHappened)

          selectionDragHandlers = undefined
        }
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

  useCursorLock(isDragging, 'draggingPositionInSequenceEditor', 'ew-resize')

  return [isDragging]
}
