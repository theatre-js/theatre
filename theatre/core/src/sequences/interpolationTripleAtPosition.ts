import type {
  BasicKeyframedTrack,
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {ConstantDerivation, prism, val} from '@theatre/dataverse'
import type {IUtilContext} from '@theatre/shared/logger'
import type {SerializableValue} from '@theatre/shared/utils/types'
import UnitBezier from 'timing-function/lib/UnitBezier'

/** `left` and `right` are not necessarily the same type.  */
export type InterpolationTriple = {
  /** `left` and `right` are not necessarily the same type.  */
  left: SerializableValue
  /** `left` and `right` are not necessarily the same type.  */
  right?: SerializableValue
  progression: number
}

// @remarks This new implementation supports sequencing non-numeric props, but it's also heavier
// on the GC. This shouldn't be a problem for the vast majority of users, but it's also a
// low-hanging fruit for perf optimization.
// It can be improved by:
// 1. Not creating a new InterpolationTriple object on every change
// 2. Caching propConfig.deserializeAndSanitize(value)

export default function interpolationTripleAtPosition(
  ctx: IUtilContext,
  trackP: Pointer<TrackData | undefined>,
  timeD: IDerivation<number>,
): IDerivation<InterpolationTriple | undefined> {
  return prism(() => {
    const track = val(trackP)
    const driverD = prism.memo(
      'driver',
      () => {
        if (!track) {
          return new ConstantDerivation(undefined)
        } else if (track.type === 'BasicKeyframedTrack') {
          return _forKeyframedTrack(ctx, track, timeD)
        } else {
          ctx.logger.error(`Track type not yet supported.`)
          return new ConstantDerivation(undefined)
        }
      },
      [track],
    )

    return driverD.getValue()
  })
}

type IStartedState = {
  started: true
  validFrom: number
  validTo: number
  der: IDerivation<InterpolationTriple | undefined>
}

type IState = {started: false} | IStartedState

function _forKeyframedTrack(
  ctx: IUtilContext,
  track: BasicKeyframedTrack,
  timeD: IDerivation<number>,
): IDerivation<InterpolationTriple | undefined> {
  return prism(() => {
    let stateRef = prism.ref<IState>('state', {started: false})
    let state = stateRef.current

    const time = timeD.getValue()

    if (!state.started || time < state.validFrom || state.validTo <= time) {
      stateRef.current = state = updateState(ctx, timeD, track)
    }

    return state.der.getValue()
  })
}

const undefinedConstD = new ConstantDerivation(undefined)

function updateState(
  ctx: IUtilContext,
  progressionD: IDerivation<number>,
  track: BasicKeyframedTrack,
): IStartedState {
  const progression = progressionD.getValue()
  if (track.keyframes.length === 0) {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: Infinity,
      der: undefinedConstD,
    }
  }

  let currentKeyframeIndex = 0

  while (true) {
    const currentKeyframe = track.keyframes[currentKeyframeIndex]

    if (!currentKeyframe) {
      if (process.env.NODE_ENV !== 'production') {
        ctx.logger.error(`Bug here`)
      }
      return states.error
    }

    const isLastKeyframe = currentKeyframeIndex === track.keyframes.length - 1

    if (progression < currentKeyframe.position) {
      if (currentKeyframeIndex === 0) {
        return states.beforeFirstKeyframe(currentKeyframe)
      } else {
        if (process.env.NODE_ENV !== 'production') {
          ctx.logger.error(`Bug here`)
        }
        return states.error
        // note: uncomment these if we support starting with currentPointIndex != 0
        // currentPointIndex--
        // continue
      }
    } else if (currentKeyframe.position === progression) {
      if (isLastKeyframe) {
        return states.lastKeyframe(currentKeyframe)
      } else {
        return states.between(
          currentKeyframe,
          track.keyframes[currentKeyframeIndex + 1],
          progressionD,
        )
      }
    } else {
      // last point
      if (currentKeyframeIndex === track.keyframes.length - 1) {
        return states.lastKeyframe(currentKeyframe)
      } else {
        const nextKeyframeIndex = currentKeyframeIndex + 1
        if (track.keyframes[nextKeyframeIndex].position <= progression) {
          currentKeyframeIndex = nextKeyframeIndex
          continue
        } else {
          return states.between(
            currentKeyframe,
            track.keyframes[currentKeyframeIndex + 1],
            progressionD,
          )
        }
      }
    }
  }
}

const states = {
  beforeFirstKeyframe(kf: Keyframe): IStartedState {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: kf.position,
      der: new ConstantDerivation({left: kf.value, progression: 0}),
    }
  },
  lastKeyframe(kf: Keyframe): IStartedState {
    return {
      started: true,
      validFrom: kf.position,
      validTo: Infinity,
      der: new ConstantDerivation({left: kf.value, progression: 0}),
    }
  },
  between(
    left: Keyframe,
    right: Keyframe,
    progressionD: IDerivation<number>,
  ): IStartedState {
    if (!left.connectedRight) {
      return {
        started: true,
        validFrom: left.position,
        validTo: right.position,
        der: new ConstantDerivation({left: left.value, progression: 0}),
      }
    }

    const solver = new UnitBezier(
      left.handles[2],
      left.handles[3],
      right.handles[0],
      right.handles[1],
    )
    const globalProgressionToLocalProgression = (
      globalProgression: number,
    ): number => {
      return (
        (globalProgression - left.position) / (right.position - left.position)
      )
    }
    const der = prism(() => {
      const progression = globalProgressionToLocalProgression(
        progressionD.getValue(),
      )

      const valueProgression = solver.solveSimple(progression)
      return {
        left: left.value,
        right: right.value,
        progression: valueProgression,
      }
    })

    return {
      started: true,
      validFrom: left.position,
      validTo: right.position,
      der,
    }
  },
  error: {
    started: true,
    validFrom: -Infinity,
    validTo: Infinity,
    der: undefinedConstD,
  } as IStartedState,
}
