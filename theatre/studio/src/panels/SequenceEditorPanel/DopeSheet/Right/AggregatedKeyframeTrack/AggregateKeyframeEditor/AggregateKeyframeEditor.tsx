import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {
  DopeSheetSelection,
  SequenceEditorPanelLayout,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {
  SequenceEditorTree_PropWithChildren,
  SequenceEditorTree_SheetObject,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {Pointer} from '@theatre/dataverse'
import {val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {AggregateKeyframePositionIsSelected} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/AggregatedKeyframeTrack/AggregatedKeyframeTrack'
import type {KeyframeWithTrack} from '@theatre/studio/panels/SequenceEditorPanel/DopeSheet/Right/collectAggregateKeyframes'
import type {SheetObjectAddress} from '@theatre/shared/utils/addresses'
import {AggregateKeyframeConnector} from './AggregateKeyframeConnector'
import {useAggregateKeyframeEditorUtils} from './useAggregateKeyframeEditorUtils'
import {AggregateKeyframeDot} from './AggregateKeyframeDot'

const AggregateKeyframeEditorContainer = styled.div`
  position: absolute;
`

export type IAggregateKeyframesAtPosition = {
  position: number
  /** all tracks have a keyframe for this position (otherwise, false means 'partial') */
  allHere: boolean
  selected: AggregateKeyframePositionIsSelected | undefined
  keyframes: KeyframeWithTrack[]
}

export type AggregatedKeyframeConnection = SheetObjectAddress & {
  trackId: SequenceTrackId
  left: Keyframe
  right: Keyframe
}

export type IAggregateKeyframeEditorProps = {
  index: number
  aggregateKeyframes: IAggregateKeyframesAtPosition[]
  layoutP: Pointer<SequenceEditorPanelLayout>
  viewModel:
    | SequenceEditorTree_PropWithChildren
    | SequenceEditorTree_SheetObject
  selection: undefined | DopeSheetSelection
}

/**
 * TODO we're spending a lot of cycles on each render of each aggreagte keyframes.
 *
 * Each keyframe node is doing O(N) operations, N being the number of underlying
 * keyframes it represetns.
 *
 * The biggest example is the `isConnectionEditingInCurvePopover()` call which is run
 * for every underlying keyframe, every time this component is rendered.
 *
 * We can optimize this away by doing all of this work _once_ when a curve editor popover
 * is open. This would require having some kind of stable identity for each aggregate row.
 * Let's defer that work until other interactive keyframe editing PRs are merged in.
 */
const AggregateKeyframeEditor: React.VFC<IAggregateKeyframeEditorProps> = (
  props,
) => {
  const utils = useAggregateKeyframeEditorUtils(props)

  return (
    <AggregateKeyframeEditorContainer
      style={{
        top: `${props.viewModel.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          utils.cur.position
        }px))`,
      }}
    >
      <AggregateKeyframeDot editorProps={props} utils={utils} />
      <AggregateKeyframeConnector editorProps={props} utils={utils} />
    </AggregateKeyframeEditorContainer>
  )
}

export default AggregateKeyframeEditor
