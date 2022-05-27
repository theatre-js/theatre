import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
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
import {AggregateKeyframeDot} from './AggregateKeyframeDot'
import AggregateKeyframeConnector from './AggregateKeyframeConnector'

const AggregateKeyframeEditorContainer = styled.div`
  position: absolute;
`

export type IAggregateKeyframesAtPosition = {
  position: number
  /** all tracks have a keyframe for this position (otherwise, false means 'partial') */
  allHere: boolean
  selected: AggregateKeyframePositionIsSelected | undefined
  keyframes: {
    kf: Keyframe
    track: {
      id: SequenceTrackId
      data: TrackData
    }
  }[]
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

const AggregateKeyframeEditor: React.VFC<IAggregateKeyframeEditorProps> = (
  props,
) => {
  const {index, aggregateKeyframes} = props
  const cur = aggregateKeyframes[index]

  return (
    <AggregateKeyframeEditorContainer
      style={{
        top: `${props.viewModel.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          cur.position
        }px))`,
      }}
    >
      <AggregateKeyframeDot
        keyframes={cur.keyframes}
        position={cur.position}
        theme={{
          isSelected: cur.selected,
        }}
        isAllHere={cur.allHere}
        {...props}
      />
      <AggregateKeyframeConnector {...props} />
    </AggregateKeyframeEditorContainer>
  )
}

export default AggregateKeyframeEditor
