import {prism} from '@theatre/dataverse'
import {createStudioSheetItemKey} from '@theatre/shared/utils/ids'
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

  return usePrism(getAggregateKeyframeEditorUtilsPrismFn(props), [
    index,
    aggregateKeyframes,
    selection,
    props.viewModel,
  ])
}

// I think this was pulled out for performance
// 1/10: Not sure this is properly split up
export function getAggregateKeyframeEditorUtilsPrismFn(
  props: Pick<
    IAggregateKeyframeEditorProps,
    'index' | 'aggregateKeyframes' | 'selection' | 'viewModel'
  >,
) {
  const {index, aggregateKeyframes, selection} = props

  const {projectId, sheetId} =
    props.viewModel.type === 'sheet'
      ? props.viewModel.sheet.address
      : props.viewModel.sheetObject.address

  return () => {
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
          ...track.sheetObject.address,
          trackId: track.id,
          left: kf,
          right: next.keyframes[i].kf,
        }))

    const allConnections = iif(() => {
      const selectedConnections = prism
        .memo(
          'selectedConnections',
          () => selectedKeyframeConnections(projectId, sheetId, selection),
          [projectId, sheetId, selection],
        )
        .getValue()

      return [...aggregatedConnections, ...selectedConnections]
    })

    const isAggregateEditingInCurvePopover = aggregatedConnections.every(
      (con) => isConnectionEditingInCurvePopover(con),
    )

    const itemKey = prism.memo(
      'itemKey',
      () => {
        if (props.viewModel.type === 'sheet') {
          return createStudioSheetItemKey.forSheetAggregateKeyframe(
            props.viewModel.sheet,
            cur.position,
          )
        } else if (props.viewModel.type === 'sheetObject') {
          return createStudioSheetItemKey.forSheetObjectAggregateKeyframe(
            props.viewModel.sheetObject,
            cur.position,
          )
        } else {
          return createStudioSheetItemKey.forCompoundPropAggregateKeyframe(
            props.viewModel.sheetObject,
            props.viewModel.pathToProp,
            cur.position,
          )
        }
      },
      [props.viewModel, cur.position],
    )

    return {
      itemKey,
      cur,
      connected,
      isAggregateEditingInCurvePopover,
      allConnections,
    }
  }
}
