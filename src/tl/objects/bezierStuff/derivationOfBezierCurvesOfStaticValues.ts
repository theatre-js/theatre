import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {Pointer} from '$shared/DataVerse/pointer'
import {
  IBezierCurvesOfScalarValues,
  ITimelineVarPoint,
} from '$tl/Project/store/types'
import {val, valueDerivation} from '$shared/DataVerse/atom'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'
import constant from '$shared/DataVerse/derivations/constant'
import * as interpolators from './interpolators/interpolators'
import interpolationDerivationForCubicBezier from '$tl/objects/bezierStuff/interpolators/interpolationDerivationForCubicBezier'

type IStartedState = {
  started: true
  validFrom: number
  validTo: number
  der: AbstractDerivation<number>
}
type IState = {started: false} | IStartedState

export function derivationOfBezierCurvesOfStaticValues(
  pointsP: Pointer<IBezierCurvesOfScalarValues['points']>,
  timeD: AbstractDerivation<number>,
): AbstractDerivation<number> {
  return valueDerivation(pointsP).flatMap(points => {
    let state: IState = {started: false}

    return autoDerive(() => {
      const time = timeD.getValue()
      if (!state.started || (time < state.validFrom || state.validTo <= time)) {
        state = pp(timeD, points)
      }

      return state.der.getValue()
    })
  })
}

const zeroConstD = constant(0)

const pp = (
  timeD: AbstractDerivation<number>,
  points: IBezierCurvesOfScalarValues['points'],
): IStartedState => {
  const time = timeD.getValue()
  // if no points
  if (points.length === 0) {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: Infinity,
      der: zeroConstD,
    }
  }

  let currentPointIndex = 0

  while (true) {
    const currentPoint = points[currentPointIndex]
    const isLastPoint = currentPointIndex === points.length - 1
    if (!currentPoint) {
      if ($env.NODE_ENV === 'development') {
        console.error(`Bug here`)
      }
      return states.error
    }

    if (time < currentPoint.time) {
      if (currentPointIndex === 0) {
        return states.beforeFirstPoint(currentPoint)
      } else {
        if ($env.NODE_ENV === 'development') {
          console.error(`Bug here`)
        }
        return states.error
        // note: uncomment these if we support starting with currentPointIndex != 0
        // currentPointIndex--
        // continue
      }
    } else if (currentPoint.time === time) {
      if (isLastPoint) {
        return states.lastPoint(currentPoint)
      } else {
        return states.between(
          currentPoint,
          points[currentPointIndex + 1],
          timeD,
        )
      }
    } else {
      // last point
      if (currentPointIndex === points.length - 1) {
        return states.lastPoint(currentPoint)
      } else {
        const nextPointIndex = currentPointIndex + 1
        if (points[nextPointIndex].time <= time) {
          currentPointIndex = nextPointIndex
          continue
        } else {
          return states.between(
            currentPoint,
            points[currentPointIndex + 1],
            timeD,
          )
        }
      }
    }
  }
}

const states = {
  beforeFirstPoint(firstPoint: ITimelineVarPoint): IStartedState {
    return {
      started: true,
      validFrom: -Infinity,
      validTo: firstPoint.time,
      der: constant(firstPoint.value),
    }
  },
  lastPoint(point: ITimelineVarPoint): IStartedState {
    return {
      started: true,
      validFrom: point.time,
      validTo: Infinity,
      der: constant(point.value),
    }
  },
  between(
    leftPoint: ITimelineVarPoint,
    rightPoint: ITimelineVarPoint,
    timeD: AbstractDerivation<number>,
  ): IStartedState {
    const leftPointTimePD = leftPoint.time

    const interpolationDescriptor = leftPoint.interpolationDescriptor
    const interpolationType = interpolationDescriptor.interpolationType
    const interpolator = (interpolators as $IntentionalAny)[
      interpolationType
    ] as typeof interpolationDerivationForCubicBezier

    let der
    if (interpolator) {
      der = interpolator({
        timeD,
        interpolationDescriptor,
        leftPointTime: leftPoint.time,
        leftPointValue: leftPoint.value,
        rightPointTime: rightPoint.time,
        rightPointValue: rightPoint.value,
      })
    } else {
      throw new Error(
        `Unkown interpolationType '${interpolationType || 'undefined'}'`,
      )
    }

    return {
      started: true,
      validFrom: leftPoint.time,
      validTo: rightPoint.time,
      der,
    }
  },
  error: {
    started: true,
    validFrom: -Infinity,
    validTo: Infinity,
    der: zeroConstD,
  } as IStartedState,
}
