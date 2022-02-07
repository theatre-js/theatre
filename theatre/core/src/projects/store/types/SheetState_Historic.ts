import type {KeyframeId, SequenceTrackId} from '@theatre/shared/utils/ids'
import type {SerializableMap, StrictRecord} from '@theatre/shared/utils/types'

export interface SheetState_Historic {
  /**
   * @remarks
   * Notes for when we implement FSMs:
   *
   * Each FSM state will have overrides of its own. Since a state could be a descendant
   * of another state, it will be able to inherit the overrides from ancestor states.
   */
  staticOverrides: {
    byObject: StrictRecord<string, SerializableMap>
  }
  sequence?: Sequence
}

type Sequence = PositionalSequence

type PositionalSequence = {
  type: 'PositionalSequence'
  length: number
  /**
   * If set to, say, 30, then the keyframe editor will try to snap all keyframes
   * to a 30fps grid
   */
  subUnitsPerUnit: number

  tracksByObject: TracksByObject
}

export type TracksByObject = StrictRecord<
  string,
  {
    trackIdByPropPath: StrictRecord<string, SequenceTrackId>
    trackData: StrictRecord<SequenceTrackId, TrackData>
  }
>

export type TrackData = BasicKeyframedTrack

export type Keyframe = {
  id: KeyframeId
  value: unknown
  position: number
  handles: [leftX: number, leftY: number, rightX: number, rightY: number]
  connectedRight: boolean
}

export interface ISelectedKeyframes {
  [trackId: string]: Keyframe[]
}

export type BasicKeyframedTrack = {
  type: 'BasicKeyframedTrack'
  keyframes: Keyframe[]
}
