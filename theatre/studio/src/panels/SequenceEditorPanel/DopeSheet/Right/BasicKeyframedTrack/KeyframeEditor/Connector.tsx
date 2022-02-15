import React, {useMemo, useEffect, useRef} from 'react'
import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import type {IContextMenuItem} from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {lighten} from 'polished'
import styled from 'styled-components'
import type {
  SequenceEditorPanelLayout,
  DopeSheetSelection,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {dotSize} from './Dot'
import type KeyframeEditor from './KeyframeEditor'
import type Sequence from '@theatre/core/sequences/Sequence'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import CurveEditorPopover from './CurveEditorPopover/CurveEditorPopover'
import {
  getContextMenuItemForPasteKeyframes,
  getContextMenuItemForCopyKeyframes,
} from '@theatre/studio/uiComponents/simpleContextMenu/getCopyPasteKeyframesItem'
import {useTrackHighlightProvider} from '@theatre/studio/panels/SequenceEditorPanel/TrackHighlightProvider'
import {getCopiedKeyframes} from '@theatre/studio/selectors'

const connectorHeight = dotSize / 2 + 1
const connectorWidthUnscaled = 1000

export const connectorTheme = {
  normalColor: `#365b59`,
  get hoverColor() {
    return lighten(0.1, connectorTheme.normalColor)
  },
  get selectedColor() {
    return lighten(0.2, connectorTheme.normalColor)
  },
  get selectedHoverColor() {
    return lighten(0.4, connectorTheme.normalColor)
  },
}

const Container = styled.div<{isSelected: boolean}>`
  position: absolute;
  background: ${(props) =>
    props.isSelected
      ? connectorTheme.selectedColor
      : connectorTheme.normalColor};
  height: ${connectorHeight}px;
  width: ${connectorWidthUnscaled}px;

  left: 0;
  top: -${connectorHeight / 2}px;
  transform-origin: top left;
  z-index: 0;
  cursor: ew-resize;

  &:after {
    display: block;
    position: absolute;
    content: ' ';
    top: -4px;
    bottom: -4px;
    left: 0;
    right: 0;
  }

  &:hover {
    background: ${(props) =>
      props.isSelected
        ? connectorTheme.selectedHoverColor
        : connectorTheme.hoverColor};
  }
`
type IProps = Parameters<typeof KeyframeEditor>[0]

const Connector: React.FC<IProps> = (props) => {
  const {index, trackData, leaf, selection} = props
  const copiedKeyframes = getCopiedKeyframes()
  const pasteKeyframesItem = useMemo(
    () => getContextMenuItemForPasteKeyframes(leaf, copiedKeyframes),
    [leaf, copiedKeyframes],
  )
  const copyKeyframesItem = useMemo(
    () => getContextMenuItemForCopyKeyframes({leaf, selection}),
    [leaf, selection],
  )
  const {setTrackToHighlightId} = useTrackHighlightProvider()

  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]
  const {trackId} = leaf

  const connectorLengthInUnitSpace = next.position - cur.position

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    {},
    () => {
      return (
        <BasicPopover>
          <CurveEditorPopover {...props} onRequestClose={closePopover} />
        </BasicPopover>
      )
    },
  )

  const [contextMenu, , isOpen] = useContextMenu(node, {
    items: () => {
      const items: IContextMenuItem[] = [
        {
          label: props.selection ? 'Delete Selection' : 'Delete both Keyframes',
          callback: () => {
            if (props.selection) {
              props.selection.delete()
            } else {
              getStudio()!.transaction(({stateEditors}) => {
                stateEditors.coreByProject.historic.sheetsById.sequence.deleteKeyframes(
                  {
                    ...props.leaf.sheetObject.address,
                    keyframeIds: [cur.id, next.id],
                    trackId: props.leaf.trackId,
                  },
                )
              })
            }
          },
        },
        {
          label: 'Open Easing Palette',
          callback: (e) => {
            openPopover(e, node!)
          },
        },
      ]

      if (pasteKeyframesItem) {
        items.unshift(pasteKeyframesItem)
      }

      if (copyKeyframesItem) {
        items.unshift(copyKeyframesItem)
      }

      return items
    },
  })

  useEffect(() => {
    if (trackId && isOpen) {
      setTrackToHighlightId(trackId)
    } else {
      setTrackToHighlightId(undefined)
    }
  }, [trackId, isOpen])

  useDragKeyframe(node, props)

  return (
    <Container
      isSelected={!!props.selection}
      ref={nodeRef}
      style={{
        transform: `scale3d(calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          connectorLengthInUnitSpace / connectorWidthUnscaled
        }), 1, 1)`,
      }}
    >
      {popoverNode}
      {contextMenu}
    </Container>
  )
}

export default Connector

function useDragKeyframe(node: HTMLDivElement | null, props: IProps) {
  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    let toUnitSpace: SequenceEditorPanelLayout['scaledSpace']['toUnitSpace']
    let tempTransaction: CommitOrDiscard | undefined
    let propsAtStartOfDrag: IProps
    let selectionDragHandlers:
      | ReturnType<DopeSheetSelection['getDragHandlers']>
      | undefined
    let sequence: Sequence
    return {
      lockCursorTo: 'ew-resize',
      onDragStart(event) {
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
        sequence = val(propsAtStartOfDrag.layoutP.sheet).getSequence()

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
              keyframeIds: [
                propsAtStartOfDrag.keyframe.id,
                propsAtStartOfDrag.trackData.keyframes[
                  propsAtStartOfDrag.index + 1
                ].id,
              ],
              translate: delta,
              scale: 1,
              origin: 0,
              snappingFunction: sequence.closestGridPosition,
            },
          )
        })
      },
      onDragEnd(dragHappened) {
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
