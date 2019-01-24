import * as interpolators from './interpolators/interpolators'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import {Pointer} from '$shared/DataVerse/pointer'
import {
  IBezierCurvesOfScalarValues,
  ITimelineVarPoint,
} from '$tl/Project/store/types'
import {val, valueDerivation} from '$shared/DataVerse/atom'
import interpolationDerivationForCubicBezier from './interpolators/interpolationDerivationForCubicBezier'
import {skipFindingColdDerivations, endSkippingColdDerivations} from '$shared/debug'

type TimelineIsEmptyBaseState = {type: 'TimelineIsEmpty'}
type TimelineIsEmptyState = Spread<
  TimelineIsEmptyBaseState,
  {
    firstIndexPD: AbstractDerivation<undefined | ITimelineVarPoint>
  }
>

type ErrorBaseState = {type: 'Error'}
type ErrorState = ErrorBaseState

type TimeIsBeforeFirstPointBaseState = {type: 'TimeIsBeforeFirstPoint'}
type TimeIsBeforeFirstPointState = Spread<
  TimeIsBeforeFirstPointBaseState,
  {
    timeOfFirstPointPD: AbstractDerivation<undefined | number>,
    valueOfFirstPointD: AbstractDerivation<undefined | number>
  }
>

type ObservingKeyBaseState = {type: 'ObservingKey'; currentPointIndex: number}
type ObservingKeyState = Spread<
  ObservingKeyBaseState,
  {
    leftPointTimePD: AbstractDerivation<undefined | number>
    isLastPointD: AbstractDerivation<undefined | null | boolean>
    possibleRightPointTimePD: AbstractDerivation<undefined | null | number>
    interpolatorD: AbstractDerivation<number>
  }
>

type PossibleBaseStates =
  | TimelineIsEmptyBaseState
  | ErrorBaseState
  | TimeIsBeforeFirstPointBaseState
  | ObservingKeyBaseState

type PossibleStates =
  | TimelineIsEmptyState
  | ErrorState
  | TimeIsBeforeFirstPointState
  | ObservingKeyState

const baseStates = {
  timelineIsEmpty: {type: 'TimelineIsEmpty'} as TimelineIsEmptyBaseState,
  error: {type: 'Error'} as ErrorBaseState,
  timeIsBeforeFirstPoint: {
    type: 'TimeIsBeforeFirstPoint',
  } as TimeIsBeforeFirstPointBaseState,
}

const handlersByState = {
  TimelineIsEmpty: {
    transitionIn(
      baseState: TimelineIsEmptyBaseState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ): TimelineIsEmptyState {
      const firstIndexPD = valueDerivation(d._pointsP[0])
      d._addDependency(firstIndexPD)
      return {
        ...baseState,
        firstIndexPD,
      }
    },

    recalculateValue(
      state: TimelineIsEmptyState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      if (d._changeObservedIn.has(state.firstIndexPD)) {
        return this._transitionOutAndRecalculateValue(state, d)
      } else {
        return d._emptyValue()
      }
    },

    _transitionOutAndRecalculateValue(
      state: TimelineIsEmptyState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      d._removeDependency(state.firstIndexPD)
      d._determineNewState()
      return d._recalculate()
    },
  },

  TimeIsBeforeFirstPoint: {
    transitionIn(
      baseState: TimeIsBeforeFirstPointBaseState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ): TimeIsBeforeFirstPointState {
      const timeOfFirstPointPD = valueDerivation(d._pointsP[0].time)
      const valueOfFirstPointD = valueDerivation(d._pointsP[0].value)
      d._addDependency(timeOfFirstPointPD)
      d._addDependency(valueOfFirstPointD)

      return {
        ...baseState,
        timeOfFirstPointPD,
        valueOfFirstPointD,
      }
    },

    recalculateValue(
      state: TimeIsBeforeFirstPointState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      // If the time of the first point has changed
      if (d._changeObservedIn.has(state.timeOfFirstPointPD)) {
        const firstPointTime = state.timeOfFirstPointPD.getValue()
        // The first point could've been removed
        if (firstPointTime === undefined) {
          return this._transitionOutAndRecalculateValue(state, d)
        }

        // if current time is still before the first point
        if (firstPointTime > d.timeD.getValue()) {
          return state.valueOfFirstPointD.getValue()
        } else {
          return this._transitionOutAndRecalculateValue(state, d)
        }
      } else if (
        d._changeObservedIn.has(d.timeD) &&
        d.timeD.getValue() >=
          ((state.timeOfFirstPointPD.getValue() as $IntentionalAny) as number)
      ) {
        return this._transitionOutAndRecalculateValue(state, d)
      } else {
        return state.valueOfFirstPointD.getValue()
      }
    },

    _transitionOutAndRecalculateValue(
      state: TimeIsBeforeFirstPointState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      d._removeDependency(state.timeOfFirstPointPD)
      d._determineNewState()
      return d._recalculate()
    },
  },

  Error: {
    transitionIn(
      _: ErrorBaseState,
      __: DerivationOfBezierCurvesOfScalarValues,
    ): ErrorState {
      return baseStates.error
    },
    recalculateValue(_: ErrorState, d: DerivationOfBezierCurvesOfScalarValues) {
      return d._emptyValue()
    },
    _transitionOutAndRecalculateValue(
      _: ErrorState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      d._determineNewState()
      return d._recalculate()
    },
  },

  ObservingKey: {
    transitionIn(
      baseState: ObservingKeyBaseState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ): ObservingKeyState {
      // debugger
      const leftPointP = d._pointsP[baseState.currentPointIndex]
      const possibleRightPointP = d._pointsP[baseState.currentPointIndex + 1]
      const isLastPointD = valueDerivation(possibleRightPointP).map(
        (possibleRightPoint: mixed) => !possibleRightPoint,
      )

      const possibleRightPointTimePD = valueDerivation(possibleRightPointP.time)

      const possibleRightPointValuePD = valueDerivation(
        possibleRightPointP.value,
      )

      // we'll bypass the interpolator if the left point goes out of existense,
      // or a point is added between it and the current time, or its time is bigger than
      // the current time
      const leftPointTimePD = valueDerivation(leftPointP.time)

      const interpolationDescriptorP = leftPointP.interpolationDescriptor
      const interpolationTypeP = interpolationDescriptorP.interpolationType

      const interpolatorD = valueDerivation(interpolationTypeP).flatMap(
        (interpolationType: string) => {
          const interpolator = (interpolators as $IntentionalAny)[
            interpolationType
          ] as typeof interpolationDerivationForCubicBezier
          if (interpolator) {
            return interpolator({
              timeD: d.timeD,
              interpolationDescriptorP,
              leftPointTimeD: valueDerivation(leftPointP.time),
              leftPointValueD: valueDerivation(leftPointP.value),
              rightPointTimeD: possibleRightPointTimePD,
              rightPointValueD: possibleRightPointValuePD,
            })
          } else {
            throw new Error(
              `Unkown interpolationType '${interpolationType || 'undefined'}'`,
            )
          }
        },
      )

      d._addDependency(leftPointTimePD)
      d._addDependency(isLastPointD)
      d._addDependency(possibleRightPointTimePD)
      d._addDependency(interpolatorD)

      return {
        ...baseState,
        leftPointTimePD,
        isLastPointD,
        possibleRightPointTimePD,
        interpolatorD,
      }
    },
    recalculateValue(
      state: ObservingKeyState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      const leftPointTime = state.leftPointTimePD.getValue()
      const time = d.timeD.getValue()
      const rightPointTime = state.possibleRightPointTimePD.getValue()

      // either point doesn't exist anymore, or it's after the current time
      if (leftPointTime === undefined || leftPointTime > time) {
        return this._transitionOutAndRecalculateValue(state, d)

        // time is between left and right point
      } else if (
        state.isLastPointD.getValue() === true ||
        (typeof rightPointTime === 'number' && rightPointTime > time)
      ) {
        return state.interpolatorD.getValue()
      } else {
        return this._transitionOutAndRecalculateValue(state, d)
      }
    },
    _transitionOutAndRecalculateValue(
      state: ObservingKeyState,
      d: DerivationOfBezierCurvesOfScalarValues,
    ) {
      d._removeDependency(state.leftPointTimePD)
      d._removeDependency(state.isLastPointD)
      d._removeDependency(state.possibleRightPointTimePD)
      d._removeDependency(state.interpolatorD)
      d._determineNewState()
      return d._recalculate()
    },
  },
}

export default class DerivationOfBezierCurvesOfScalarValues extends AbstractDerivation<
  number
> {
  _hot: boolean
  _changeObservedIn: Set<
    AbstractDerivation<number | null | undefined | ITimelineVarPoint>
  >
  _state: PossibleStates
  

  constructor(
    readonly _pointsP: Pointer<IBezierCurvesOfScalarValues['points']>,
    readonly timeD: AbstractDerivation<number>,
  ) {
    super()
    this._addDependency(timeD)
    // @ts-ignore @todo
    this._state = {type: 'started'}
    this._changeObservedIn = new Set()
  }

  _keepUptodate() {
    this._hot = true
    this._determineNewState()
  }

  _stopkeepingUptodate() {
    this._hot = false
  }

  _emptyValue() {
    return 0
  }

  _recalculate(): number {
    if (!this._hot) {
      throw new Error(
        `Cold reads aren't supported on Timeline/DerivationOfBezierCurvesOfScalarValues`,
      )
    }

    const state = this._state

    const value: number = (handlersByState as $IntentionalAny)[
      state.type
    ].recalculateValue(state, this)

    this._changeObservedIn.clear()

    return value
  }

  _determineNewState(startSearchingFromPointIndex: number = 0) {
    const baseState = this._determinNewBaseState(startSearchingFromPointIndex)

    this._state = (handlersByState as $IntentionalAny)[
      baseState.type
    ].transitionIn(baseState, this)
  }

  _determinNewBaseState(
    startSearchingFromPointIndex: number,
  ): PossibleBaseStates {
    skipFindingColdDerivations()
    const points = val(this._pointsP)
    endSkippingColdDerivations()


    // if no points
    if (points.length === 0) {
      return baseStates.timelineIsEmpty
    }

    let currentPointIndex: number
    if (startSearchingFromPointIndex === 0) {
      currentPointIndex = 0
    } else {
      currentPointIndex = points[startSearchingFromPointIndex]
        ? startSearchingFromPointIndex
        : 0
    }

    const time = this.timeD.getValue()

    while (true) {
      const currentPoint = points[currentPointIndex]
      if (!currentPoint) {
        console.error(`Bug here`)
        return baseStates.error
      }

      if (currentPoint.time > time) {
        if (currentPointIndex === 0) {
          return baseStates.timeIsBeforeFirstPoint
        } else {
          currentPointIndex--
          continue
        }
      } else if (currentPoint.time === time) {
        return {type: 'ObservingKey', currentPointIndex}
      } else {
        if (currentPointIndex === points.length - 1) {
          return {type: 'ObservingKey', currentPointIndex}
        } else {
          const nextPointIndex = currentPointIndex + 1
          if (points[nextPointIndex].time <= time) {
            currentPointIndex = nextPointIndex
            continue
          } else {
            return {type: 'ObservingKey', currentPointIndex}
          }
        }
      }
    }
  }

  _youMayNeedToUpdateYourself(
    msgComingFrom: AbstractDerivation<
      number | null | undefined | ITimelineVarPoint
    >,
  ) {
    this._changeObservedIn.add(msgComingFrom)

    AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
      this,
      msgComingFrom,
    )
  }
}
