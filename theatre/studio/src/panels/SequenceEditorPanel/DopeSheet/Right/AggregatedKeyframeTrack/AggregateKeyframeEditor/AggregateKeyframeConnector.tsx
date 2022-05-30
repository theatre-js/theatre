import {val} from '@theatre/dataverse'
import React, {useMemo, useRef} from 'react'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import type {UseDragOpts} from '@theatre/studio/uiComponents/useDrag'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import getStudio from '@theatre/studio/getStudio'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import type {IAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import CurveEditorPopover from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/CurveEditorPopover/CurveEditorPopover'
import {useAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import styled from 'styled-components'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'

const POPOVER_MARGIN_PX = 5
const EasingPopoverWrapper = styled(BasicPopover)`
  --popover-outer-stroke: transparent;
  --popover-inner-stroke: rgba(26, 28, 30, 0.97);
`
export const AggregateCurveEditorPopover: React.FC<
  IAggregateKeyframeEditorProps & {closePopover: (reason: string) => void}
> = React.forwardRef((props, ref) => {
  const {allConnections} = useAggregateKeyframeEditorUtils(props)

  return (
    <EasingPopoverWrapper
      showPopoverEdgeTriangle={false}
      // @ts-ignore @todo
      ref={ref}
    >
      <CurveEditorPopover
        curveConnection={allConnections[0]}
        additionalConnections={allConnections}
        onRequestClose={props.closePopover}
      />
    </EasingPopoverWrapper>
  )
})

export const AggregateKeyframeConnector: React.VFC<IAggregateKeyframeConnectorProps> =
  (props) => {
    const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)
    const {editorProps} = props

    const [isDragging] = useDragKeyframe(node, props.editorProps)

    const [popoverNode, openPopover, closePopover] = usePopover(
      () => {
        const rightDims = val(editorProps.layoutP.rightDims)

        return {
          debugName: 'Connector',
          constraints: {
            minX: rightDims.screenX + POPOVER_MARGIN_PX,
            maxX: rightDims.screenX + rightDims.width - POPOVER_MARGIN_PX,
          },
        }
      },
      () => {
        return (
          <AggregateCurveEditorPopover
            {...editorProps}
            closePopover={closePopover}
          />
        )
      },
    )

    const {connected, isAggregateEditingInCurvePopover} = props.utils

    // We don't want to interrupt an existing drag, so in order to persist the dragged
    // html node, we just set the connector length to 0, but we don't remove it yet.
    return connected || isDragging ? (
      <>
        <ConnectorLine
          ref={nodeRef}
          connectorLengthInUnitSpace={connected ? connected.length : 0}
          isSelected={connected ? connected.selected : false}
          isPopoverOpen={isAggregateEditingInCurvePopover}
          openPopover={(e) => {
            if (node) openPopover(e, node)
          }}
        />
        {popoverNode}
      </>
    ) : (
      <></>
    )
  }
type IAggregateKeyframeConnectorProps = {
  utils: IAggregateKeyframeEditorUtils
  editorProps: IAggregateKeyframeEditorProps
}
function useDragKeyframe(
  node: HTMLDivElement | null,
  editorProps: IAggregateKeyframeEditorProps,
) {
  const propsRef = useRef(editorProps)
  propsRef.current = editorProps

  const gestureHandlers = useMemo<UseDragOpts>(() => {
    return {
      debugName: 'useDragKeyframe',
      lockCSSCursorTo: 'ew-resize',
      onDragStart(event) {
        const props = propsRef.current
        let tempTransaction: CommitOrDiscard | undefined

        const keyframes = props.aggregateKeyframes[props.index].keyframes

        if (
          props.selection &&
          props.aggregateKeyframes[props.index].selected ===
            AggregateKeyframePositionIsSelected.AllSelected
        ) {
          const {selection, viewModel} = props
          const {sheetObject} = viewModel
          return selection
            .getDragHandlers({
              ...sheetObject.address,
              domNode: node!,
              positionAtStartOfDrag:
                props.aggregateKeyframes[props.index].position,
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
            tempTransaction = getStudio().tempTransaction(({stateEditors}) => {
              for (const keyframe of keyframes) {
                stateEditors.coreByProject.historic.sheetsById.sequence.transformKeyframes(
                  {
                    ...propsAtStartOfDrag.viewModel.sheetObject.address,
                    trackId: keyframe.track.id,
                    keyframeIds: [
                      keyframe.kf.id,
                      keyframe.track.data.keyframes[
                        keyframe.track.data.keyframes.indexOf(keyframe.kf) + 1
                      ].id,
                    ],
                    translate: delta,
                    scale: 1,
                    origin: 0,
                    snappingFunction: sequence.closestGridPosition,
                  },
                )
              }
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

  return useDrag(node, gestureHandlers)
}
