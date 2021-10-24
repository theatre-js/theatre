import type {
  BasicKeyframedTrack,
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {ConstantDerivation, prism, val} from '@theatre/dataverse'
import logger from '@theatre/shared/logger'
import UnitBezier from 'timing-function/lib/UnitBezier'
import type {Interpolator, PropTypeConfig} from '@theatre/core/propTypes'

export default function trackValueAtTime(
  trackP: Pointer<TrackData<unknown> | undefined>,
  timeD: IDerivation<number>,
  propConfig: PropTypeConfig | undefined,
): IDerivation<unknown> {
  return prism(() => {
    const track = val(trackP)
    const driverD = prism.memo(
      'driver',
      () => {
        if (!track) {
          return new ConstantDerivation(undefined)
        } else if (track.type === 'BasicKeyframedTrack') {
          let interpolator = propConfig?.interpolator as Interpolator<unknown>
          if (!interpolator)
            interpolator = (
              left: unknown,
              right: unknown,
              progression: number,
            ) => {
              if (typeof left === 'number' && typeof right === 'number') {
                return left + progression * (right - left)
              }
              return left
            }
          return trackValueAtTime_keyframedTrack<unknown>(
            track as BasicKeyframedTrack<unknown>,
            timeD,
            interpolator,
          )
        } else {
          logger.error(`Track type not yet supported.`)
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
  der: IDerivation<unknown>
}
type IState = {started: false} | IStartedState

function trackValueAtTime_keyframedTrack<T>(
  track: BasicKeyframedTrack<T>,
  timeD: IDerivation<number>,
  interpolator: Interpolator<T>,
): IDerivation<unknown> {
  return prism(() => {
    let stateRef = prism.ref<IState>('state', {started: false})
    let state = stateRef.current

    const time = timeD.getValue()

    if (!state.started || time < state.validFrom || state.validTo <= time) {
      stateRef.current = state = updateState(timeD, track, interpolator)
    }

    return state.der.getValue()
  })
}

const undefinedConstD = new ConstantDerivation(undefined)

const updateState = <T>(
  progressionD: IDerivation<number>,
  track: BasicKeyframedTrack<T>,
  interpolator: Interpolator<T>,
): IStartedState => {
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
        logger.error(`Bug here`)
      }
      return states.error
    }

    const isLastKeyframe = currentKeyframeIndex === track.keyframes.length - 1

    if (progression < currentKeyframe.position) {
      if (currentKeyframeIndex === 0) {
        return states.beforeFirstKeyframe(currentKeyframe)
      } else {
        if (process.env.NODE_ENV !== 'production') {
          logger.error(`Bug here`)
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
        return states.between<T>(
          currentKeyframe,
          track.keyframes[currentKeyframeIndex + 1],
          progressionD,
          interpolator,
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
          return states.between<T>(
            currentKeyframe,
            track.keyframes[currentKeyframeIndex + 1],
            progressionD,
            interpolator,
          )
        }
      }
    }
  }
}

const states = {
  beforeFirstKeyframe<T>(kf: Keyframe<T>): IStartedState {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: kf.position,
      der: new ConstantDerivation(kf.value),
    }
  },
  lastKeyframe<T>(kf: Keyframe<T>): IStartedState {
    return {
      started: true,
      validFrom: kf.position,
      validTo: Infinity,
      der: new ConstantDerivation(kf.value),
    }
  },
  between<T>(
    left: Keyframe<T>,
    right: Keyframe<T>,
    progressionD: IDerivation<number>,
    interpolator: Interpolator<T>,
  ): IStartedState {
    if (!left.connectedRight) {
      return {
        started: true,
        validFrom: left.position,
        validTo: right.position,
        der: new ConstantDerivation(left.value),
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
      return interpolator(left.value, right.value, valueProgression, solver)
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
