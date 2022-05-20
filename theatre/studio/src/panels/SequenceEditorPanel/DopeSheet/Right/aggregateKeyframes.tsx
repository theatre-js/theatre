import getStudio from '@theatre/studio/getStudio'
import {val} from '@theatre/dataverse'
import type {
  SequenceEditorTree_PrimitiveProp,
  SequenceEditorTree_PropWithChildren,
} from '@theatre/studio/panels/SequenceEditorPanel/layout/tree'
import type {SequenceTrackId} from '@theatre/shared/utils/ids'
import type {
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'

export type AggregatedKeyframes = {
  byPosition: Map<number, AggregateKeyframe[]>
  tracks: AggregateTrack[]
}

export type AggregateTrack = {
  id: SequenceTrackId
  data: TrackData
}

export type AggregateKeyframe = {
  kf: Keyframe
  track: AggregateTrack
}

// Strongly consider this being a a part of the leaf construction in "tree.ts"
export function collectAggregateKeyframes(
  // currently just `SequenceEditorTree_PropWithChildren`, will
  // need to support `SequenceEditorTree_SheetObject` as well
  leaf: SequenceEditorTree_PropWithChildren,
): AggregatedKeyframes {
  const childSimpleProps: SequenceEditorTree_PrimitiveProp[] =
    leaf.children.flatMap((c) => {
      return c.type === 'primitiveProp' ? [c] : []
    })

  const sheetObject = leaf.sheetObject
  const projectId = sheetObject.address.projectId

  const sheetObjectTracksP =
    getStudio().atomP.historic.coreByProject[projectId].sheetsById[
      sheetObject.address.sheetId
    ].sequence.tracksByObject[sheetObject.address.objectKey]

  const tracks = childSimpleProps.flatMap((childSimpleProp) => {
    const trackId = val(
      sheetObjectTracksP.trackIdByPropPath[
        JSON.stringify(childSimpleProp.pathToProp)
      ],
    )
    if (!trackId) return []
    const trackData = val(sheetObjectTracksP.trackData[trackId])
    if (!trackData) return []

    return [{id: trackId, data: trackData}]
  })

  const byPosition = new Map<number, AggregateKeyframe[]>()

  for (const track of tracks) {
    const kfs = track.data.keyframes
    for (let i = 0; i < kfs.length; i++) {
      const kf = kfs[i]
      let existing = byPosition.get(kf.position)
      if (!existing) {
        existing = []
        byPosition.set(kf.position, existing)
      }
      existing.push({kf, track})
    }
  }

  return {
    byPosition,
    tracks,
  }
}
