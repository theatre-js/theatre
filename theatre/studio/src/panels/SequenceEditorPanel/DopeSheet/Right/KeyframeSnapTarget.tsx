import type {SequenceEditorPanelLayout} from '@theatre/studio/panels/SequenceEditorPanel/layout/layout'
import type {Pointer} from '@theatre/dataverse'
import {Box, val} from '@theatre/dataverse'
import React from 'react'
import styled from 'styled-components'
import {DopeSnapHitZoneUI} from '@theatre/studio/panels/SequenceEditorPanel/RightOverlay/DopeSnapHitZoneUI'
import type {ObjectAddressKey, SequenceTrackId} from '@theatre/shared/utils/ids'
import type {
  BasicKeyframedTrack,
  HistoricPositionalSequence,
  Keyframe,
} from '@theatre/core/projects/store/types/SheetState_Historic'

const HitZone = styled.div`
  z-index: 1;
  cursor: ew-resize;

  ${DopeSnapHitZoneUI.CSS}

  #pointer-root.draggingPositionInSequenceEditor & {
    ${DopeSnapHitZoneUI.CSS_WHEN_SOMETHING_DRAGGING}
  }
`

const Container = styled.div`
  position: absolute;
`

export type ISnapTargetPRops = {
  layoutP: Pointer<SequenceEditorPanelLayout>
  leaf: {nodeHeight: number}
  position: number
}

const KeyframeSnapTarget: React.VFC<ISnapTargetPRops> = (props) => {
  return (
    <Container
      style={{
        top: `${props.leaf.nodeHeight / 2}px`,
        left: `calc(${val(
          props.layoutP.scaledSpace.leftPadding,
        )}px + calc(var(--unitSpaceToScaledSpaceMultiplier) * ${
          props.position
        }px))`,
      }}
    >
      <HitZone
        {...DopeSnapHitZoneUI.reactProps({
          isDragging: false,
          position: props.position,
        })}
      />
    </Container>
  )
}

export default KeyframeSnapTarget

export type KeyframeSnapPositions = {
  [objectKey: ObjectAddressKey]: {
    [trackId: SequenceTrackId]: number[]
  }
}

// The following boxes are read by BasicKeyframeTrack and AggregateKeyframeTrack
// to place snap targets in the keyframe tracks.

// A box holding all the valid snap positions per track per object.
export const snapPositionsB = new Box<KeyframeSnapPositions>({})

// A convenience flag to specify that we want to snap everywhere where there's currently a keyframe.
export const snapToAllKeyframesB = new Box(false)

export function collectKeyframeSnapPositions(
  tracksByObject: HistoricPositionalSequence['tracksByObject'],
  shouldIncludeKeyframe: (
    kf: Keyframe,
    track: {
      trackId: SequenceTrackId
      trackData: BasicKeyframedTrack
      objectKey: ObjectAddressKey
    },
  ) => boolean,
): KeyframeSnapPositions {
  return Object.fromEntries(
    Object.entries(tracksByObject).map(
      ([objectKey, trackDataAndTrackIdByPropPath]) => [
        objectKey,
        Object.fromEntries(
          Object.entries(trackDataAndTrackIdByPropPath!.trackData).map(
            ([trackId, track]) => [
              trackId,
              track!.keyframes
                .filter((kf) =>
                  shouldIncludeKeyframe(kf, {
                    trackId,
                    trackData: track!,
                    objectKey,
                  }),
                )
                .map((keyframe) => keyframe.position),
            ],
          ),
        ),
      ],
    ),
  )
}
