import getStudio from '@theatre/studio/getStudio'
import type {CommitOrDiscard} from '@theatre/studio/StudioStore/StudioStore'
import useDrag from '@theatre/studio/uiComponents/useDrag'
import useRefAndState from '@theatre/studio/utils/useRefAndState'
import {val} from '@theatre/dataverse'
import React from 'react'
import {useMemo, useRef} from 'react'
import type {IAggregateKeyframeEditorProps} from './AggregateKeyframeEditor'
import {ConnectorLine} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/keyframeRowUI/ConnectorLine'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'

type IAggregateKeyframeConnectorProps = IAggregateKeyframeEditorProps

const AggregateKeyframeConnector: React.VFC<IAggregateKeyframeConnectorProps> =
  (props) => {
    const [nodeRef, node] = useRefAndState<HTMLDivElement | null>(null)

    const [isDragging] = useDragKeyframe(node, props)

    const {index, aggregateKeyframes} = props
    const cur = aggregateKeyframes[index]
    const next = props.aggregateKeyframes[index + 1]
    const connected =
      next && cur.keyframes.length === next.keyframes.length
        ? // all keyframes are same in the next position
          cur.keyframes.every(
            ({track}, ind) => next.keyframes[ind].track === track,
          ) && {
            length: next.position - cur.position,
            selected:
              cur.selected ===
                AggregateKeyframePositionIsSelected.AllSelected &&
              next.selected === AggregateKeyframePositionIsSelected.AllSelected,
          }
        : null

    // We don't want to interrupt an existing drag, so in order to persist the dragged
    // html node, we just set the connector length to 0, but we don't remove it yet.
    return connected || isDragging ? (
      <ConnectorLine
        ref={nodeRef}
        isPopoverOpen={false}
        connectorLengthInUnitSpace={connected ? connected.length : 0}
        isSelected={connected ? connected.selected : false}
      />
    ) : (
      <></>
    )
  }
export default AggregateKeyframeConnector

function useDragKeyframe(
  node: HTMLDivElement | null,
  props: IAggregateKeyframeConnectorProps,
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

        const keyframes = props.aggregateKeyframes[props.index].keyframes

        if (props.selection) {
          const selectedKeyframeIDs = Object.values(
            props.selection.byObjectKey!,
          ).flatMap((ok) =>
            Object.values(ok!.byTrackId).flatMap((ti) =>
              Object.keys(ti!.byKeyframeId),
            ),
          )

          // If all children are selected, we delegate to the selection's drag handler
          // otherwise we handle it ourselves
          const allChildrenAreSelected = keyframes
            .map((kf) => kf.kf.id)
            .every((id) => selectedKeyframeIDs.includes(id))

          if (allChildrenAreSelected) {
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
