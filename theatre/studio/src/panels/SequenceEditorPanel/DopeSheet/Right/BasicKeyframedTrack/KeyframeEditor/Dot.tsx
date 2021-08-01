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
import React, {useMemo, useRef, useState} from 'react'
import styled from 'styled-components'
import type KeyframeEditor from './KeyframeEditor'
import {useLockFrameStampPosition} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'
import {attributeNameThatLocksFramestamp} from '@theatre/studio/panels/SequenceEditorPanel/FrameStampPositionProvider'

export const dotSize = 6
const hitZoneSize = 12

const dims = (size: number) => `
  left: ${-size / 2 + 1}px;
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

  &:hover + ${Square} {
    ${dims(dotSize + 5)}
  }
`

type IProps = Parameters<typeof KeyframeEditor>[0]

const Dot: React.FC<IProps> = (props) => {
  const [ref, node] = useRefAndState<HTMLDivElement | null>(null)

  const [contextMenu] = useKeyframeContextMenu(node, props)
  useDragKeyframe(node, props)

  return (
    <>
      <HitZone
        ref={ref}
        title={props.keyframe.position.toFixed(8)}
        data-pos={props.keyframe.position.toFixed(3)}
        {...{
          [attributeNameThatLocksFramestamp]:
            props.keyframe.position.toFixed(3),
        }}
      />
      <Square isSelected={!!props.selection} />
      {contextMenu}
    </>
  )
}

export default Dot

function useKeyframeContextMenu(node: HTMLDivElement | null, props: IProps) {
  return useContextMenu(node, {
    items: () => {
      return [
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
    },
  })
}

function useDragKeyframe(node: HTMLDivElement | null, props: IProps) {
  const [isDragging, setIsDragging] = useState(false)
  useLockFrameStampPosition(isDragging, props.keyframe.position)

  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps

    let selectionDragHandlers:
      | ReturnType<DopeSheetSelection['getDragHandlers']>
      | undefined

    return {
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
        setIsDragging(true)
        if (propsRef.current.selection) {
          const {selection, leaf} = propsRef.current
          const {sheetObject} = leaf
          selectionDragHandlers = selection.getDragHandlers({
            ...sheetObject.address,
            pathToProp: leaf.pathToProp,
            trackId: leaf.trackId,
            keyframeId: propsRef.current.keyframe.id,
          })
          selectionDragHandlers.onDragStart?.(event)
          return
        }

        propsAtStartOfDrag = propsRef.current
        toUnitSpace = val(propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace)
      },
      onDrag(dx, dy, event) {
        if (selectionDragHandlers) {
          selectionDragHandlers.onDrag(dx, dy, event)
          return
        }
        const delta = toUnitSpace(dx)

        if (tempTransaction) {
          tempTransaction.discard()
          tempTransaction = undefined
        }
        tempTransaction = getStudio()!.tempTransaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.sheetsById.sequence.transformKeyframes(
            {
              ...propsAtStartOfDrag.leaf.sheetObject.address,
              trackId: propsAtStartOfDrag.leaf.trackId,
              keyframeIds: [propsAtStartOfDrag.keyframe.id],
              translate: delta,
              scale: 1,
              origin: 0,
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
}
