import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import {lighten} from 'polished'
import React from 'react'
import {useMemo, useRef} from 'react'
import styled from 'styled-components'
import type {
  SequenceEditorPanelLayout,
  DopeSheetSelection,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import {DOT_SIZE_PX} from './Dot'
import type KeyframeEditor from './KeyframeEditor'
import type Sequence from '@theatre/core/sequences/Sequence'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import CurveEditorPopover from './CurveEditorPopover/CurveEditorPopover'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import type {OpenFn} from '@theatre/studio/src/uiComponents/Popover/usePopover'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'

const CONNECTOR_HEIGHT = DOT_SIZE_PX / 2 + 1
const CONNECTOR_WIDTH_UNSCALED = 1000

export const CONNECTOR_THEME = {
  normalColor: `#365b59`,
  get hoverColor() {
    return lighten(0.1, CONNECTOR_THEME.normalColor)
  },
  get selectedColor() {
    return lighten(0.2, CONNECTOR_THEME.normalColor)
  },
  get selectedHoverColor() {
    return lighten(0.4, CONNECTOR_THEME.normalColor)
  },
}

const Container = styled.div<{isSelected: boolean}>`
  position: absolute;
  background: ${(props) =>
    props.isSelected
      ? CONNECTOR_THEME.selectedColor
      : CONNECTOR_THEME.normalColor};
  height: ${CONNECTOR_HEIGHT}px;
  width: ${CONNECTOR_WIDTH_UNSCALED}px;

  left: 0;
  top: -${CONNECTOR_HEIGHT / 2}px;
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
        ? CONNECTOR_THEME.selectedHoverColor
        : CONNECTOR_THEME.hoverColor};
  }
`
type IProps = Parameters<typeof KeyframeEditor>[0]

const Connector: React.FC<IProps> = (props) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const {isPointerBeingCaptured} = usePointerCapturing(
    'KeyframeEditor Connector',
  )

  const [popoverNode, openPopover, closePopover, _isPopoverOpen] = usePopover(
    {
      closeWhenPointerIsDistant: !isPointerBeingCaptured(),
    },
    () => {
      return (
        <BasicPopover>
          <CurveEditorPopover {...props} onRequestClose={closePopover} />
        </BasicPopover>
      )
    },
  )

  const [contextMenu] = useConnectorContextMenu(
    props,
    node,
    cur,
    next,
    openPopover,
  )
  useDragKeyframe(node, props)

  const connectorLengthInUnitSpace = next.position - cur.position

  return (
    <Container
      isSelected={!!props.selection}
      ref={nodeRef}
      style={{
        transform: `scale3d(calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          connectorLengthInUnitSpace / CONNECTOR_WIDTH_UNSCALED
        }), 1, 1)`,
      }}
      onClick={(e) => {
        if (node) openPopover(e, node)
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
      debugName: 'useDragKeyframe',
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

function useConnectorContextMenu(
  props: IProps,
  node: HTMLDivElement | null,
  cur: Keyframe,
  next: Keyframe,
  openPopover: OpenFn,
) {
  const maybeKeyframeIds = selectedKeyframeIdsIfInSingleTrack(props.selection)
  return useContextMenu(node, {
    items: () => {
      return [
        {
          label: maybeKeyframeIds ? 'Copy Selection' : 'Copy both Keyframes',
          callback: () => {
            if (maybeKeyframeIds) {
              const keyframes = maybeKeyframeIds.map(
                (keyframeId) =>
                  props.trackData.keyframes.find(
                    (keyframe) => keyframe.id === keyframeId,
                  )!,
              )

              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  keyframes,
                )
              })
            } else {
              getStudio!().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes([
                  cur,
                  next,
                ])
              })
            }
          },
        },
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
    },
  })
}
