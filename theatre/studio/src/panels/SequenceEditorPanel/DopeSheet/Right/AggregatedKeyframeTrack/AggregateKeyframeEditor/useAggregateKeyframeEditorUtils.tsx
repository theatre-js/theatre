import {prism} from '@theatre/dataverse'
import {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import {isConnectionEditingInCurvePopover} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/BasicKeyframedTrack/KeyframeEditor/CurveEditorPopover/CurveEditorPopover'
import {usePrism} from '@theatre/react'
import {selectedKeyframeConnections} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/selections'
import type {
  IAggregateKeyframeEditorProps,
  AggregatedKeyframeConnection,
} from './AggregateKeyframeEditor'
import {iif} from './iif'

export type IAggregateKeyframeEditorUtils = ReturnType<
  typeof useAggregateKeyframeEditorUtils
>

// I think this was pulled out for performance
// 1/10: Not sure this is properly split up
export function useAggregateKeyframeEditorUtils(
  props: Pick<
    IAggregateKeyframeEditorProps,
    'index' | 'aggregateKeyframes' | 'selection' | 'viewModel'
  >,
) {
  const {index, aggregateKeyframes, selection} = props
  const sheetObjectAddress = props.viewModel.sheetObject.address

  return usePrism(() => {
    const cur = aggregateKeyframes[index]
    const next = aggregateKeyframes[index + 1]

    const curAndNextAggregateKeyframesMatch =
      next &&
      cur.keyframes.length === next.keyframes.length &&
      cur.keyframes.every(({track}, ind) => next.keyframes[ind].track === track)

    const connected = curAndNextAggregateKeyframesMatch
      ? {
          length: next.position - cur.position,
          selected:
            cur.selected === AggregateKeyframePositionIsSelected.AllSelected &&
            next.selected === AggregateKeyframePositionIsSelected.AllSelected,
        }
      : null

    const aggregatedConnections: AggregatedKeyframeConnection[] = !connected
      ? []
      : cur.keyframes.map(({kf, track}, i) => ({
          ...sheetObjectAddress,
          trackId: track.id,
          left: kf,
          right: next.keyframes[i].kf,
        }))

    const allConnections = iif(() => {
      const {projectId, sheetId} = sheetObjectAddress

      const selectedConnections = prism
        .memo(
          'selectedConnections',
          () =>
            selectedKeyframeConnections(
              sheetObjectAddress.projectId,
              sheetObjectAddress.sheetId,
              selection,
            ),
          [projectId, sheetId, selection],
        )
        .getValue()

      return [...aggregatedConnections, ...selectedConnections]
    })

    const isAggregateEditingInCurvePopover = aggregatedConnections.every(
      (con) => isConnectionEditingInCurvePopover(con),
    )

    return {
      cur,
      connected,
      isAggregateEditingInCurvePopover,
      allConnections,
    }
  }, [index, aggregateKeyframes, selection, sheetObjectAddress])
}
