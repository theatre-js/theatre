import type {
  KeyframedTrack,
  Keyframe,
  TrackData,
} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {IDerivation, Pointer} from '@theatre/dataverse'
import {ConstantDerivation, prism, val} from '@theatre/dataverse'
import logger from '@theatre/shared/logger'
import {interpolate} from '@theatre/shared/utils/colors'
import UnitBezier from 'timing-function/lib/UnitBezier'

export default function trackValueAtTime(
  trackP: Pointer<TrackData | undefined>,
  timeD: IDerivation<number>,
): IDerivation<unknown> {
  return prism(() => {
    const track = val(trackP)
    const driverD = prism.memo(
      'driver',
      () => {
        if (!track) {
          return new ConstantDerivation(undefined)
        } else if (track.type === 'BasicKeyframedTrack') {
          return trackValueAtTime_keyframedTrack(
            track,
            timeD,
            (left, right, progression) => {
              return left + progression * (right - left)
            },
          )
        } else if (track.type === 'ColorKeyframedTrack') {
          return trackValueAtTime_keyframedTrack(track, timeD, interpolate)
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

function trackValueAtTime_keyframedTrack(
  track: KeyframedTrack,
  timeD: IDerivation<number>,
  computeValue: (left: number, right: number, progression: number) => number,
): IDerivation<unknown> {
  return prism(() => {
    let stateRef = prism.ref<IState>('state', {started: false})
    let state = stateRef.current

    const time = timeD.getValue()

    if (!state.started || time < state.validFrom || state.validTo <= time) {
      stateRef.current = state = updateState(timeD, track, computeValue)
    }

    return state.der.getValue()
  })
}

const undefinedConstD = new ConstantDerivation(undefined)

const updateState = (
  progressionD: IDerivation<number>,
  track: KeyframedTrack,
  computeValue: (left: number, right: number, progression: number) => number,
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
        return states.between(
          currentKeyframe,
          track.keyframes[currentKeyframeIndex + 1],
          progressionD,
          computeValue,
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
            computeValue,
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
      der: new ConstantDerivation(kf.value),
    }
  },
  lastKeyframe(kf: Keyframe): IStartedState {
    return {
      started: true,
      validFrom: kf.position,
      validTo: Infinity,
      der: new ConstantDerivation(kf.value),
    }
  },
  between(
    left: Keyframe,
    right: Keyframe,
    progressionD: IDerivation<number>,
    computeValue: (left: number, right: number, progression: number) => number,
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
      return computeValue(left.value, right.value, valueProgression)
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
