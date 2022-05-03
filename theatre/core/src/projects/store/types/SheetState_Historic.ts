import type {
  KeyframeId,
  ObjectAddressKey,
  SequenceTrackId,
} from '@theatre/shared/utils/ids'
import type {
  SerializableMap,
  SerializableValue,
  StrictRecord,
} from '@theatre/shared/utils/types'

export interface SheetState_Historic {
  /**
   * @remarks
   * Notes for when we implement FSMs:
   *
   * Each FSM state will have overrides of its own. Since a state could be a descendant
   * of another state, it will be able to inherit the overrides from ancestor states.
   */
  staticOverrides: {
    byObject: StrictRecord<ObjectAddressKey, SerializableMap>
  }
  sequence?: HistoricPositionalSequence
}

// Question: What is this? The timeline position of a sequence?
export type HistoricPositionalSequence = {
  type: 'PositionalSequence'
  length: number
  /**
   * Given the most common case of tracking a sequence against time (where 1 second = position 1),
   * If set to, say, 30, then the keyframe editor will try to snap all keyframes
   * to a 30fps grid
   */
  subUnitsPerUnit: number

  tracksByObject: StrictRecord<
    ObjectAddressKey,
    {
      trackIdByPropPath: StrictRecord<string, SequenceTrackId>
      trackData: StrictRecord<SequenceTrackId, TrackData>
    }
  >
}

export type TrackData = BasicKeyframedTrack

export type Keyframe = {
  id: KeyframeId
  /** The `value` is the raw value type such as `Rgba` or `number`. See {@link SerializableValue} */
  // Future: is there another layer that we may need to be able to store older values on the
  // case of a prop config change? As keyframes can technically have their propConfig changed.
  value: SerializableValue
  position: number
  handles: [leftX: number, leftY: number, rightX: number, rightY: number]
  connectedRight: boolean
}

export type BasicKeyframedTrack = {
  type: 'BasicKeyframedTrack'
  /**
   * {@link Keyframe} is not provided an explicit generic value `T`, because
   * a single track can technically have multiple different types for each keyframe.
   */
  keyframes: Keyframe[]
}
