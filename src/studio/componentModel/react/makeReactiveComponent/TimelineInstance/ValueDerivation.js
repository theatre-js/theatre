// @flow
import * as D from '$shared/DataVerse'
import * as _ from 'lodash'
import * as interpolators from './interpolators'

type TimelineIsEmptyBaseState = {|type: 'TimelineIsEmpty'|}
type TimelineIsEmptyState = {
  ...TimelineIsEmptyBaseState,
  firstIdP: D.IDerivation<null | string>,
}

type ErrorBaseState = {|type: 'Error'|}
type ErrorState = {...ErrorBaseState}

type TimeIsBeforeFirstPointBaseState = {|type: 'TimeIsBeforeFirstPoint'|}
type TimeIsBeforeFirstPointState = {
  ...TimeIsBeforeFirstPointBaseState,
  timeOfFirstPointD: D.IDerivation<?number>,
}

type ObservingKeyBaseState = {|type: 'ObservingKey', key: string|}
type ObservingKeyState = {
  ...ObservingKeyBaseState,
  leftPointTimeP: D.IDerivation<?number>,
  isLastPointD: D.IDerivation<?boolean>,
  possibleRightPointTimeD: D.IDerivation<?number>,
  interpolatorD: D.IDerivation<$FixMe>,
}

type PossibleBaseStates =
  | TimelineIsEmptyBaseState
  | ErrorBaseState
  | TimeIsBeforeFirstPointBaseState
  | ObservingKeyBaseState

const baseStates = {
  timelineIsEmpty: {type: 'TimelineIsEmpty'},
  error: {type: 'Error'},
  timeIsBeforeFirstPoint: {type: 'TimeIsBeforeFirstPoint'},
}

const handlersByState = {
  TimelineIsEmpty: {
    transitionIn(
      baseState: TimelineIsEmptyBaseState,
      d: ValueDerivation,
    ): TimelineIsEmptyState {
      const firstIdP = d._pointsP.prop('firstId')
      d._addDependency(firstIdP)
      return {
        ...baseState,
        firstIdP,
      }
    },

    recalculateValue(state: TimelineIsEmptyState, d: ValueDerivation) {
      if (d._changeObservedIn.has(state.firstIdP)) {
        return this._transitionOutAndRecalculateValue(state, d)
      } else {
        return d._emptyValue()
      }
    },

    _transitionOutAndRecalculateValue(
      state: TimelineIsEmptyState,
      d: ValueDerivation,
    ) {
      d._removeDependency(state.firstIdP)
      d._determineNewState()
      return d._recalculate()
    },
  },

  TimeIsBeforeFirstPoint: {
    transitionIn(
      baseState: TimeIsBeforeFirstPointBaseState,
      d: ValueDerivation,
    ): TimeIsBeforeFirstPointState {
      const firstPointD = d._pointsP
        .prop('firstId')
        .flatMap(
          (firstId: ?string) =>
            firstId ? d._pointsP.prop('byId').prop(firstId) : undefined,
        )

      const timeOfFirstPointD = firstPointD.flatMap(
        (firstPoint: ?$FixMe) =>
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
    // eslint-disable-next-line no-unused-vars
    transitionIn(baseState: ErrorBaseState, d: ValueDerivation): ErrorState {
      return baseStates.error
    },
    recalculateValue(state: ErrorState, d: ValueDerivation) {
      return d._emptyValue()
    },
    _transitionOutAndRecalculateValue(state: ErrorState, d: ValueDerivation) {
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
      const leftPointP = d._pointsP.prop('byId').prop(baseState.key)
      const rightPointIdP = leftPointP.prop('nextId')
      const isLastPointD = rightPointIdP.flatMap(
        (rightPointId: string | void) =>
          typeof rightPointId === 'string' ? rightPointId === 'end' : undefined,
      )

      const possibleRightPointD = rightPointIdP.flatMap((nextId: ?string) => {
        if (typeof nextId === 'string' && nextId !== 'end') {
          return d._pointsP.prop('byId').prop(nextId)
        }
      })

      const possibleRightPointTimeD = possibleRightPointD.flatMap(
        (rightPoint: ?$FixMe) =>
          rightPoint && rightPoint.pointer().prop('time'),
      )

      const possibleRightPointValueD = possibleRightPointD.flatMap(
        (rightPoint: ?$FixMe) =>
          rightPoint && rightPoint.pointer().prop('value'),
      )

      // we'll bypass the interpolator if the left point goes out of existense,
      // or a point is added between it and the current time, or its time is bigger than
      // the current time
      const leftPointTimeP = leftPointP.prop('time')
      // const rightPoint

      // const leftPointInterpolatorTypeP = leftPointP.prop('interpolator').prop('type')

      const interpolationDescriptorP = leftPointP.prop(
        'interpolationDescriptor',
      )
      const interpolationTypeP = interpolationDescriptorP.prop(
        'interpolationType',
      )
      const interpolatorD = interpolationTypeP.flatMap(
        (interpolationType: ?string) => {
          // $FlowIgnore
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

export default class ValueDerivation extends D.derivations.AbstractDerivation {
  _descP: *
  _timeD: *
  _pointsP: *
  _pointsProxy: *
  _studio: $FixMe
  _pathToValueDescriptor: Array<string>
  _pathToPointsById: Array<string>
  _state: $FixMe

  constructor(
    descP: $FixMe,
    timeD: $FixMe,
    studio: $FixMe,
    pathToValueDescriptor: Array<string>,
  ) {
    super()
    this._descP = descP
    this._studio = studio
    this._pathToValueDescriptor = pathToValueDescriptor
    this._pathToPointsById = [...pathToValueDescriptor, 'points', 'byId']
    this._pointsP = descP.prop('points')
    // this._pointsProxy = D.derivations.autoProxyDerivedDict(
    //   this._pointsP,
    //   this._studio.ticker,
    // )
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
    // debugger
    return 0
  }

  _recalculate() {
    if (!this._hot) {
      throw new Error(`Cold reads aren't supported on Timeline/ValueDerivation`)
    }

    const state = this._state

    const value = handlersByState[state.type].recalculateValue(
      (state: $IntentionalAny),
      this,
    )

    this._changeObservedIn.clear()

    return value
  }

  _determineNewState(startSearchingFromPointId: string = 'head') {
    const baseState = this._determinNewBaseState(startSearchingFromPointId)

    this._state = handlersByState[baseState.type].transitionIn(
      (baseState: $IntentionalAny),
      this,
    )
  }

  _determinNewBaseState(startSearchingFromPointId: string): PossibleBaseStates {
    const points = _.get(
      this._studio.store.reduxStore.getState(),
      this._pathToValueDescriptor,
    ).points

    // if no points
    if (!points.firstId) {
      if (process.env.NODE_ENV === 'development') {
        if (Object.keys(points.byId).length > 0) {
          console.error(`Bug here`) // this means there ARE some points in the timline, but points.firstId is null
        }
      }
      return baseStates.timelineIsEmpty
    }

    let currentPoint
    if (startSearchingFromPointId === 'head') {
      currentPoint = points.byId[points.firstId]
    } else {
      currentPoint = points.byId[startSearchingFromPointId]
      if (!currentPoint) currentPoint = points.byId[points.firstId]
    }

    const time = this._timeD.getValue()

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!currentPoint) {
        console.error(`Bug here`) // this means the doubly linked list is broken somewhere
        return baseStates.error
      }

      if (currentPoint.time > time) {
        if (currentPoint.prevId === 'head') {
          return baseStates.timeIsBeforeFirstPoint
        } else {
          currentPoint = points.byId[currentPoint.prevId]
          continue
        }
      } else if (currentPoint.time === time) {
        return {type: 'ObservingKey', key: currentPoint.id}
      } else {
        if (currentPoint.nextId === 'end') {
          return {type: 'ObservingKey', key: currentPoint.id}
        } else {
          const nextPoint = points.byId[currentPoint.nextId]
          if (nextPoint.time <= time) {
            currentPoint = nextPoint
            continue
          } else {
            return {type: 'ObservingKey', key: currentPoint.id}
          }
        }
      }
    }

    // (flow is too stupid to recognise this)
    // eslint-disable-next-line no-unreachable
    return baseStates.error
  }

  _youMayNeedToUpdateYourself(msgComingFrom: D.IDerivation<$FixMe>) {
    this._changeObservedIn.add(msgComingFrom)

    D.derivations.AbstractDerivation.prototype._youMayNeedToUpdateYourself.call(
      this,
      msgComingFrom,
    )
  }
}
