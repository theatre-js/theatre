import type {
  BasicKeyframedTrack,
  TrackData,
} from '@theatre/core/types/private/core'
import type {Prism, Pointer} from '@theatre/dataverse'
import {prism, val} from '@theatre/dataverse'
import UnitBezier from 'timing-function/lib/UnitBezier'
import type {BasicKeyframe, SerializableValue} from '@theatre/core'
import {getSortedKeyframesCached} from '@theatre/core/utils/keyframeUtils'

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
  trackP: Pointer<TrackData | undefined>,
  timeD: Prism<number>,
): Prism<InterpolationTriple | undefined> {
  return prism(() => {
    const track = val(trackP)
    const driverD = prism.memo(
      'driver',
      () => {
        if (!track) {
          return prism(() => undefined)
        } else if (track.type === 'BasicKeyframedTrack') {
          return _forKeyframedTrack(track, timeD)
        } else {
          console.error(`Track type not yet supported.`)
          return prism(() => undefined)
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
  der: Prism<InterpolationTriple | undefined>
}

type IState = {started: false} | IStartedState

function _forKeyframedTrack(
  track: BasicKeyframedTrack,
  timeD: Prism<number>,
): Prism<InterpolationTriple | undefined> {
  return prism(() => {
    let stateRef = prism.ref<IState>('state', {started: false})
    let state = stateRef.current

    const time = timeD.getValue()

    if (!state.started || time < state.validFrom || state.validTo <= time) {
      stateRef.current = state = updateState(timeD, track)
    }

    return state.der.getValue()
  })
}

const undefinedConstD = prism(() => undefined)

function updateState(
  progressionD: Prism<number>,
  track: BasicKeyframedTrack,
): IStartedState {
  const keyframes = getSortedKeyframesCached(track.keyframes)
  const progression = progressionD.getValue()
  if (keyframes.length === 0) {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: Infinity,
      der: undefinedConstD,
    }
  }

  let currentKeyframeIndex = 0

  while (true) {
    const currentKeyframe = keyframes[currentKeyframeIndex]

    if (!currentKeyframe) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Bug here`)
      }
      return states.error
    }

    const isLastKeyframe = currentKeyframeIndex === keyframes.length - 1

    if (progression < currentKeyframe.position) {
      if (currentKeyframeIndex === 0) {
        return states.beforeFirstKeyframe(currentKeyframe)
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Bug here`)
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
          keyframes[currentKeyframeIndex + 1],
          progressionD,
        )
      }
    } else {
      // last point
      if (currentKeyframeIndex === keyframes.length - 1) {
        return states.lastKeyframe(currentKeyframe)
      } else {
        const nextKeyframeIndex = currentKeyframeIndex + 1
        if (keyframes[nextKeyframeIndex].position <= progression) {
          currentKeyframeIndex = nextKeyframeIndex
          continue
        } else {
          return states.between(
            currentKeyframe,
            keyframes[currentKeyframeIndex + 1],
            progressionD,
          )
        }
      }
    }
  }
}

const states = {
  beforeFirstKeyframe(kf: BasicKeyframe): IStartedState {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: kf.position,
      der: prism(() => ({left: kf.value, progression: 0})),
    }
  },
  lastKeyframe(kf: BasicKeyframe): IStartedState {
    return {
      started: true,
      validFrom: kf.position,
      validTo: Infinity,
      der: prism(() => ({left: kf.value, progression: 0})),
    }
  },
  between(
    left: BasicKeyframe,
    right: BasicKeyframe,
    progressionD: Prism<number>,
  ): IStartedState {
    if (!left.connectedRight) {
      return {
        started: true,
        validFrom: left.position,
        validTo: right.position,
        der: prism(() => ({left: left.value, progression: 0})),
      }
    }

    const globalProgressionToLocalProgression = (
      globalProgression: number,
    ): number => {
      return (
        (globalProgression - left.position) / (right.position - left.position)
      )
    }

    if (!left.type || left.type === 'bezier') {
      const solver = new UnitBezier(
        left.handles[2],
        left.handles[3],
        right.handles[0],
        right.handles[1],
      )

      const bezierDer = prism(() => {
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
        der: bezierDer,
      }
    }

    const holdDer = prism(() => {
      const progression = globalProgressionToLocalProgression(
        progressionD.getValue(),
      )
      const valueProgression = Math.floor(progression)
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
      der: holdDer,
    }
  },
  error: {
    started: true,
    validFrom: -Infinity,
    validTo: Infinity,
    der: undefinedConstD,
  } as IStartedState,
}
