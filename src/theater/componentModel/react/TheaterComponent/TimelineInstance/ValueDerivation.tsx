import * as _ from 'lodash-es'
import * as interpolators from './interpolators/interpolators'
import AbstractDerivation from '$shared/DataVerse/derivations/AbstractDerivation'
import Theater from '$theater/bootstrap/Theater'

type TimelineIsEmptyBaseState = {type: 'TimelineIsEmpty'}
type TimelineIsEmptyState = Spread<
  TimelineIsEmptyBaseState,
  {
    firstIndexP: AbstractDerivation<undefined | mixed>
  }
>

type ErrorBaseState = {type: 'Error'}
type ErrorState = ErrorBaseState

type TimeIsBeforeFirstPointBaseState = {type: 'TimeIsBeforeFirstPoint'}
type TimeIsBeforeFirstPointState = Spread<
  TimeIsBeforeFirstPointBaseState,
  {
    timeOfFirstPointD: AbstractDerivation<undefined | null | number>
  }
>

type ObservingKeyBaseState = {type: 'ObservingKey'; currentPointIndex: number}
type ObservingKeyState = Spread<
  ObservingKeyBaseState,
  {
    leftPointTimeP: AbstractDerivation<undefined | null | number>
    isLastPointD: AbstractDerivation<undefined | null | boolean>
    possibleRightPointTimeD: AbstractDerivation<undefined | null | number>
    interpolatorD: AbstractDerivation<$FixMe>
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
      d: ValueDerivation,
    ): TimelineIsEmptyState {
      const firstIndexP = d._pointsP.index(0)
      d._addDependency(firstIndexP)
      return {
        ...baseState,
        firstIndexP,
      }
    },

    recalculateValue(state: TimelineIsEmptyState, d: ValueDerivation) {
      if (d._changeObservedIn.has(state.firstIndexP)) {
        return this._transitionOutAndRecalculateValue(state, d)
      } else {
        return d._emptyValue()
      }
    },

    _transitionOutAndRecalculateValue(
      state: TimelineIsEmptyState,
      d: ValueDerivation,
    ) {
      d._removeDependency(state.firstIndexP)
      d._determineNewState()
      return d._recalculate()
    },
  },

  TimeIsBeforeFirstPoint: {
    transitionIn(
      baseState: TimeIsBeforeFirstPointBaseState,
      d: ValueDerivation,
    ): TimeIsBeforeFirstPointState {
      const firstPointP = d._pointsP.index(0)

      const timeOfFirstPointD = firstPointP.flatMap(
        (firstPoint?: $FixMe) =>
          firstPoint && firstPoint.pointer().prop('time'),
      )
      d._addDependency(timeOfFirstPointD)

      return {
        ...baseState,
        timeOfFirstPointD,
      }
    },

    recalculateValue(state: TimeIsBeforeFirstPointState, d: ValueDerivation) {
      // If the time of the first point has changed
      if (d._changeObservedIn.has(state.timeOfFirstPointD)) {
        const firstPointTime = state.timeOfFirstPointD.getValue()
        // The first point could've been removed
        if (firstPointTime === undefined) {
          return this._transitionOutAndRecalculateValue(state, d)
        }

        // if current time is still before the first point
        if (firstPointTime > d._timeD.getValue()) {
          return d._emptyValue()
        } else {
          return this._transitionOutAndRecalculateValue(state, d)
        }
      } else if (
        d._changeObservedIn.has(d._timeD) &&
        d._timeD.getValue() >= state.timeOfFirstPointD.getValue()
      ) {
        return this._transitionOutAndRecalculateValue(state, d)
      } else {
        return d._emptyValue()
      }
    },

    _transitionOutAndRecalculateValue(
      state: TimeIsBeforeFirstPointState,
      d: ValueDerivation,
    ) {
      d._removeDependency(state.timeOfFirstPointD)
      d._determineNewState()
      return d._recalculate()
    },
  },

  Error: {
    transitionIn(_: ErrorBaseState, __: ValueDerivation): ErrorState {
      return baseStates.error
    },
    recalculateValue(_: ErrorState, d: ValueDerivation) {
      return d._emptyValue()
    },
    _transitionOutAndRecalculateValue(_: ErrorState, d: ValueDerivation) {
      d._determineNewState()
      return d._recalculate()
    },
  },

  ObservingKey: {
    recalculateValue(state: ObservingKeyState, d: ValueDerivation) {
      const leftPointTime = state.leftPointTimeP.getValue()
      const time = d._timeD.getValue()
      const rightPointTime = state.possibleRightPointTimeD.getValue()

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
      d: ValueDerivation,
    ) {
      d._removeDependency(state.leftPointTimeP)
      d._removeDependency(state.isLastPointD)
      d._removeDependency(state.possibleRightPointTimeD)
      d._removeDependency(state.interpolatorD)
      d._determineNewState()
      return d._recalculate()
    },
    transitionIn(
      baseState: ObservingKeyBaseState,
      d: ValueDerivation,
    ): ObservingKeyState {
      // debugger
      const leftPointP = d._pointsP.index(baseState.currentPointIndex)
      const possibleRightPointP = d._pointsP.index(
        baseState.currentPointIndex + 1,
      )
      const isLastPointD = possibleRightPointP.map(
        (possibleRightPoint: mixed) => !possibleRightPoint,
      )

      const possibleRightPointTimeD = possibleRightPointP.prop('time')

      const possibleRightPointValueD = possibleRightPointP.prop('value')

      // we'll bypass the interpolator if the left point goes out of existense,
      // or a point is added between it and the current time, or its time is bigger than
      // the current time
      const leftPointTimeP = leftPointP.prop('time')

      const interpolationDescriptorP = leftPointP.prop(
        'interpolationDescriptor',
      )
      const interpolationTypeP = interpolationDescriptorP.prop(
        'interpolationType',
      )

      const interpolatorD = interpolationTypeP.flatMap(
        (interpolationType: undefined | null | string) => {
          // @ts-ignore
          const interpolator = interpolators[interpolationType]
          if (interpolator) {
            return interpolator({
              timeD: d._timeD,
              interpolationDescriptorP,
              leftPointTimeD: leftPointP.prop('time'),
              leftPointValueD: leftPointP.prop('value'),
              rightPointTimeD: possibleRightPointTimeD,
              rightPointValueD: possibleRightPointValueD,
            })
          } else {
            throw new Error(
              `Unkown interpolationType '${interpolationType || 'undefined'}'`,
            )
          }
        },
      )

      d._addDependency(leftPointTimeP)
      d._addDependency(isLastPointD)
      d._addDependency(possibleRightPointTimeD)
      d._addDependency(interpolatorD)

      return {
        ...baseState,
        leftPointTimeP,
        isLastPointD,
        possibleRightPointTimeD,
        interpolatorD,
      }
    },
  },
}

export default class ValueDerivation extends AbstractDerivation<$FixMe> {
  _hot: boolean
  _changeObservedIn: Set<$FixMe>
  _descP: $FixMe
  _timeD: $FixMe
  _pointsP: $FixMe
  _pointsProxy: $FixMe
  _theater: $FixMe
  _pathToValueDescriptor: Array<string>
  _pathToPointsById: Array<string>
  _state: PossibleStates

  constructor(
    descP: $FixMe,
    timeD: $FixMe,
    theater: Theater,
    pathToValueDescriptor: Array<string>,
  ) {
    super()
    this._descP = descP
    this._theater = theater
    this._pathToValueDescriptor = pathToValueDescriptor
    this._pathToPointsById = [...pathToValueDescriptor, 'points', 'byId']
    this._pointsP = descP.prop('points')
    this._timeD = timeD
    this._addDependency(timeD)
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

  _recalculate(): $FixMe {
    if (!this._hot) {
      throw new Error(`Cold reads aren't supported on Timeline/ValueDerivation`)
    }

    const state = this._state

    const value: mixed = (handlersByState as $IntentionalAny)[
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
    const points = _.get(
      this._theater.store.getState(),
      this._pathToValueDescriptor,
    ).points

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

    const time = this._timeD.getValue()

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

  _youMayNeedToUpdateYourself(msgComingFrom: AbstractDerivation<$FixMe>) {
    this._changeObservedIn.add(msgComingFrom)

    AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
      this,
      msgComingFrom,
    )
  }
}
