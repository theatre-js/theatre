import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useContextMenu from '@theatre/studio/uiComponents/simpleContextMenu/useContextMenu'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import React from 'react'
import {useMemo, useRef} from 'react'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import CurveEditorPopover, {
  isCurveEditorOpenD,
} from './CurveEditorPopover/CurveEditorPopover'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import type {OpenFn} from '@theatre/studio/src/uiComponents/Popover/usePopover'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import {usePointerCapturing} from '@theatre/studio/UIRoot/PointerCapturing'
import type {ISingleKeyframeEditorProps} from './SingleKeyframeEditor'
import type {IConnectorThemeValues} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {COLOR_POPOVER_BACK} from './CurveEditorPopover/colors'
import {useVal} from '@theatre/react'
import type {KeyframeConnectionWithAddress} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import {
  isKeyframeConnectionInSelection,
  selectedKeyframeConnections,
} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'

import styled from 'styled-components'

const POPOVER_MARGIN = 5

const EasingPopover = styled(BasicPopover)`
  --popover-outer-stroke: transparent;
  --popover-inner-stroke: ${COLOR_POPOVER_BACK};
`

type IBasicKeyframeConnectorProps = ISingleKeyframeEditorProps

const BasicKeyframeConnector: React.VFC<IBasicKeyframeConnectorProps> = (
  props,
) => {
  const {index, trackData} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const {isPointerBeingCaptured} = usePointerCapturing(
    'KeyframeEditor Connector',
  )

  const selectedConnections = selectedKeyframeConnections(
    props.leaf.sheetObject.address.projectId,
    props.leaf.sheetObject.address.sheetId,
    props.selection,
  ).getValue()

  const curveConnection: KeyframeConnectionWithAddress = {
    left: cur,
    right: next,
    trackId: props.leaf.trackId,
    ...props.leaf.sheetObject.address,
  }

  const rightDims = val(props.layoutP.rightDims)
  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    {
      debugName: 'Connector',
      closeWhenPointerIsDistant: !isPointerBeingCaptured(),
      constraints: {
        minX: rightDims.screenX + POPOVER_MARGIN,
        maxX: rightDims.screenX + rightDims.width - POPOVER_MARGIN,
      },
    },
    () => {
      return (
        <EasingPopover showPopoverEdgeTriangle={false}>
          <CurveEditorPopover
            curveConnection={curveConnection}
            additionalConnections={selectedConnections}
            onRequestClose={closePopover}
          />
        </EasingPopover>
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

  // The following two flags determine whether this connector
  // is being edited as part of a selection using the curve
  // editor popover
  const isCurveEditorPopoverOpen = useVal(isCurveEditorOpenD)
  const isInCurveEditorPopoverSelection =
    isCurveEditorPopoverOpen &&
    props.selection !== undefined &&
    isKeyframeConnectionInSelection({left: cur, right: next}, props.selection)

  const themeValues: IConnectorThemeValues = {
    isPopoverOpen: isPopoverOpen || isInCurveEditorPopoverSelection || false,
    isSelected: !!props.selection,
  }

  return (
    <ConnectorLine
      ref={nodeRef}
      connectorLengthInUnitSpace={connectorLengthInUnitSpace}
      {...themeValues}
      openPopover={(e) => {
        if (node) openPopover(e, node)
      }}
    >
      {popoverNode}
      {contextMenu}
    </ConnectorLine>
  )
}
export default BasicKeyframeConnector

function useDragKeyframe(
  node: HTMLDivElement | null,
  props: IBasicKeyframeConnectorProps,
) {
  const propsRef = useRef(props)
  propsRef.current = props

  const gestureHandlers = useMemo<Parameters<typeof useDrag>[1]>(() => {
    return {
      debugName: 'useDragKeyframe',
      lockCSSCursorTo: 'ew-resize',
      onDragStart(event) {
        const props = propsRef.current
        let tempTransaction: CommitOrDiscard | undefined

        if (props.selection) {
          const {selection, leaf} = props
          const {sheetObject} = leaf
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              pathToProp: leaf.pathToProp,
              trackId: leaf.trackId,
              keyframeId: props.keyframe.id,
              domNode: node!,
              positionAtStartOfDrag:
                props.trackData.keyframes[props.index].position,
            })
            .onDragStart(event)
        }

        const propsAtStartOfDrag = props
        const sequence = val(propsAtStartOfDrag.layoutP.sheet).getSequence()

        const toUnitSpace = val(
          propsAtStartOfDrag.layoutP.scaledSpace.toUnitSpace,
        )

        return {
          onDrag(dx, dy, event) {
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
            if (dragHappened) {
              if (tempTransaction) {
                tempTransaction.commit()
              }
            } else {
              if (tempTransaction) {
                tempTransaction.discard()
              }
            }
          },
        }
      },
    }
  }, [])

  useDrag(node, gestureHandlers)
}
function useConnectorContextMenu(
  props: IBasicKeyframeConnectorProps,
  node: HTMLDivElement | null,
  cur: Keyframe,
  next: Keyframe,
  openPopover: OpenFn,
) {
  const maybeKeyframeIds = selectedKeyframeIdsIfInSingleTrack(props.selection)
  return useContextMenu(node, {
    menuItems: () => {
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
