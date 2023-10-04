import type {Nominal} from '@theatre/utils/Nominal'
import type {PointableSet} from '@theatre/utils/PointableSet'
import type {PathToProp_Encoded} from '@theatre/utils/pathToProp'

import type {
  SerializableMap,
  SerializableValue,
  StrictRecord,
} from '@theatre/utils/types'

export type KeyframeId = Nominal<'KeyframeId'>
export type SequenceTrackId = Nominal<'SequenceTrackId'>
export type ObjectAddressKey = Nominal<'ObjectAddressKey'>
export type ProjectId = Nominal<'ProjectId'>
export type SheetId = Nominal<'SheetId'>
export type SheetInstanceId = Nominal<'SheetInstanceId'>

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
  length?: number
  /**
   * Given the most common case of tracking a sequence against time (where 1 second = position 1),
   * If set to, say, 30, then the keyframe editor will try to snap all keyframes
   * to a 30fps grid
   */
  subUnitsPerUnit?: number

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

export type KeyframeType = 'bezier' | 'hold'

export type Keyframe = {
  id: KeyframeId
  /** The `value` is the raw value type such as `Rgba` or `number`. See {@link SerializableValue} */
  // Future: is there another layer that we may need to be able to store older values on the
  // case of a prop config change? As keyframes can technically have their propConfig changed.
  value: SerializableValue
  position: number
  handles: [leftX: number, leftY: number, rightX: number, rightY: number]
  connectedRight: boolean
  // defaults to 'bezier' to support project states made with theatre0.5.1 or earlier
  type?: KeyframeType
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
  keyframes: PointableSet<KeyframeId, Keyframe>
}

type ProjectLoadingState =
  | {type: 'loading'}
  | {type: 'loaded'}
  | {
      type: 'browserStateIsNotBasedOnDiskState'
      onDiskState: OnDiskState
    }

/**
 * Ephemeral state is neither persisted nor undoable
 */
export interface ProjectEphemeralState {
  loadingState: ProjectLoadingState
  lastExportedObject: null | OnDiskState
}

/**
 * This is the state of each project that is consumable by `@theatre/core`.
 * If the studio is present, this part of the state joins the studio's historic state,
 * at {@link StudioHistoricState.coreByProject}
 */
export interface ProjectState_Historic {
  sheetsById: StrictRecord<SheetId, SheetState_Historic>
  /**
   * The last 50 revision IDs this state is based on, starting with the most recent one.
   * The most recent one is the revision ID of this state
   */
  revisionHistory: string[]
  definitionVersion: string
}

export interface ProjectState {
  historic: ProjectState_Historic
  // ephemeral: ProjectEphemeralState
}

export interface OnDiskState extends ProjectState_Historic {}
