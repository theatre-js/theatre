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
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {ISingleKeyframeEditorProps} from './SingleKeyframeEditor'
import type {IConnectorThemeValues} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {COLOR_POPOVER_BACK} from './CurveEditorPopover/colors'
import {usePrism} from '@theatre/react'
import type {KeyframeConnectionWithAddress} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import {copyableKeyframesFromSelection} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
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
  const {index, track} = props
  const cur = track.data.keyframes[index]
  const next = track.data.keyframes[index + 1]

  const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

  const {
    node: popoverNode,
    toggle: togglePopover,
    close: closePopover,
  } = usePopover(
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

  const [contextMenu] = useConnectorContextMenu(props, node, cur, next)
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
    <>
      <ConnectorLine
        ref={nodeRef}
        connectorLengthInUnitSpace={connectorLengthInUnitSpace}
        {...themeValues}
        openPopover={(e) => {
          if (node) togglePopover(e, node)
        }}
      >
        {popoverNode}
      </ConnectorLine>
      {/* contextMenu is placed outside of the ConnectorLine so that clicking on
      the contextMenu does not count as clicking on the ConnectorLine */}
      {contextMenu}
    </>
  )
}
export default BasicKeyframeConnector

const SingleCurveEditorPopover: React.FC<
  IBasicKeyframeConnectorProps & {closePopover: (reason: string) => void}
> = React.forwardRef((props, ref) => {
  const {
    index,
    track: {data: trackData},
    selection,
  } = props
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
                props.track.data.keyframes[props.index].position,
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
                    propsAtStartOfDrag.track.data.keyframes[
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
) {
  // TODO?: props.selection is undefined if only one of the connected keyframes is selected

  return useContextMenu(node, {
    displayName: 'Tween',
    menuItems: () => {
      const copyableKeyframes = copyableKeyframesFromSelection(
        props.leaf.sheetObject.address.projectId,
        props.leaf.sheetObject.address.sheetId,
        props.selection,
      )

      return [
        {
          label: copyableKeyframes.length > 0 ? 'Copy (selection)' : 'Copy',
          callback: () => {
            if (copyableKeyframes.length > 0) {
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes(
                  copyableKeyframes,
                )
              })
            } else {
              getStudio().transaction((api) => {
                api.stateEditors.studio.ahistoric.setClipboardKeyframes([
                  {keyframe: cur, pathToProp: props.leaf.pathToProp},
                  {keyframe: next, pathToProp: props.leaf.pathToProp},
                ])
              })
            }
          },
        },
        {
          label: props.selection ? 'Delete (selection)' : 'Delete',
          callback: () => {
            if (props.selection) {
              props.selection.delete()
            } else {
              getStudio().transaction(({stateEditors}) => {
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
      ]
    },
  })
}
