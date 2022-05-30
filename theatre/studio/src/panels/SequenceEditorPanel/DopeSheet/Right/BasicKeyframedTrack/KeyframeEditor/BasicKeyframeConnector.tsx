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
  isConnectionEditingInCurvePopover,
} from './CurveEditorPopover/CurveEditorPopover'
import selectedKeyframeIdsIfInSingleTrack from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/selectedKeyframeIdsIfInSingleTrack'
import type {OpenFn} from '@theatre/studio/src/uiComponents/Popover/usePopover'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {ISingleKeyframeEditorProps} from './SingleKeyframeEditor'
import type {IConnectorThemeValues} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {COLOR_POPOVER_BACK} from './CurveEditorPopover/colors'
import {usePrism} from '@theatre/react'
import type {KeyframeConnectionWithAddress} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import {selectedKeyframeConnections} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'

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

  const [popoverNode, openPopover, closePopover, isPopoverOpen] = usePopover(
    () => {
      const rightDims = val(props.layoutP.rightDims)
      return {
        debugName: 'Connector',
        constraints: {
          minX: rightDims.screenX + POPOVER_MARGIN,
          maxX: rightDims.screenX + rightDims.width - POPOVER_MARGIN,
        },
      }
    },
    () => <SingleCurveEditorPopover {...props} closePopover={closePopover} />,
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

  const isInCurveEditorPopoverSelection = usePrism(
    () =>
      isConnectionEditingInCurvePopover({
        ...props.leaf.sheetObject.address,
        trackId: props.leaf.trackId,
        left: cur,
        right: next,
      }),
    [props.leaf.sheetObject.address, props.leaf.trackId, cur, next],
  )

  const themeValues: IConnectorThemeValues = {
    isPopoverOpen: isInCurveEditorPopoverSelection,
    isSelected: props.selection !== undefined,
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

const SingleCurveEditorPopover: React.FC<
  IBasicKeyframeConnectorProps & {closePopover: (reason: string) => void}
> = React.forwardRef((props, ref) => {
  const {index, trackData, selection} = props
  const cur = trackData.keyframes[index]
  const next = trackData.keyframes[index + 1]

  const trackId = props.leaf.trackId
  const address = props.leaf.sheetObject.address

  const selectedConnections = usePrism(
    () =>
      selectedKeyframeConnections(
        address.projectId,
        address.sheetId,
        selection,
      ).getValue(),
    [address, selection],
  )

  const curveConnection: KeyframeConnectionWithAddress = {
    left: cur,
    right: next,
    trackId,
    ...address,
  }

  return (
    <EasingPopover
      showPopoverEdgeTriangle={false}
      // @ts-ignore @todo
      ref={ref}
    >
      <CurveEditorPopover
        curveConnection={curveConnection}
        additionalConnections={selectedConnections}
        onRequestClose={props.closePopover}
      />
    </EasingPopover>
  )
})

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
