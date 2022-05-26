import type {PathToProp_Encoded} from '@theatre/shared/utils/addresses'
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
  /**
   * This is the length of the sequence in unit position. If the sequence
   * is interpreted in seconds, then a length=2 means the sequence is two
   * seconds long.
   *
   * Note that if there are keyframes sitting after sequence.length, they don't
   * get truncated, but calling sequence.play() will play until it reaches the
   * length of the sequence.
   */
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
      // I think this prop path has to be to a basic keyframe track (simple prop)
      // at least until we have other kinds of "TrackData".
      // Explicitly, this does not include prop paths for compound props (those
      // are sequenced by sequenecing their simple descendant props)
      trackIdByPropPath: StrictRecord<PathToProp_Encoded, SequenceTrackId>

      /**
       * A flat record of SequenceTrackId to TrackData. It's better
       * that only its sub-props are observed (say via val(pointer(...))),
       * rather than the object as a whole.
       */
      trackData: StrictRecord<SequenceTrackId, TrackData>
    }
  >
}

/**
 * Currently just {@link BasicKeyframedTrack}.
 *
 * Future: Other types of tracks can be added in, such as `MixedTrack` which would
 * look like `[keyframes, expression, moreKeyframes, anotherExpression, …]`.
 */
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

type TrackDataCommon<TypeName extends string> = {
  type: TypeName
  /**
   * Initial name of the track for debugging purposes. In the future, let's
   * strip this value from `studio.createContentOfSaveFile()` Could also be
   * useful for users who manually edit the project state.
   */
  __debugName?: string
}

export type BasicKeyframedTrack = TrackDataCommon<'BasicKeyframedTrack'> & {
  /**
   * {@link Keyframe} is not provided an explicit generic value `T`, because
   * a single track can technically have multiple different types for each keyframe.
   */
  keyframes: Keyframe[]
}
