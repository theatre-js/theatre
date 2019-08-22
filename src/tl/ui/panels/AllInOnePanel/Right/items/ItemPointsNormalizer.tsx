import React from 'react'
import {DurationContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import {
  IPoints,
  INormalizedPoints,
  IExtremums,
  IDuration,
  INumberTuple,
  IPointHandles,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import noop from '$shared/utils/noop'

interface IProps {
  points: IPoints
  children: (
    normalizedPoints: INormalizedPoints,
    extremums: IExtremums,
    duration: IDuration,
  ) => React.ReactChild
}

interface IState {}

export type IExtremumsAPI = {
  persist: () => void
  unpersist: () => void
}

export const ExtremumsAPIContext = React.createContext<IExtremumsAPI>({
  persist: noop,
  unpersist: noop,
})

type ICache = {
  extremums: IExtremums
  duration: IDuration
  points: IPoints
  normalizedPoints: INormalizedPoints
}

const defaultCache: ICache = {
  extremums: [-5, 5],
  duration: 0,
  normalizedPoints: [],
  points: [],
}

class ItemPointsNormalizer extends React.PureComponent<IProps, IState> {
  shouldPersistExtremums: boolean = false
  cache: ICache = {...defaultCache}

  render() {
    const {points} = this.props
    const extremums = this.getExtremums(points)
    return (
      <ExtremumsAPIContext.Provider value={this.api}>
        <DurationContext.Consumer>
          {duration => {
            const normalizedPoints = this.getNormalizedPoints(
              points,
              duration,
              extremums,
            )

            return this.props.children(normalizedPoints, extremums, duration)
          }}
        </DurationContext.Consumer>
      </ExtremumsAPIContext.Provider>
    )
  }

  componentWillUnmount() {
    delete this.cache
  }

  persistExtremums: IExtremumsAPI['persist'] = () => {
    this.shouldPersistExtremums = true
  }

  unpersistExtremums: IExtremumsAPI['unpersist'] = () => {
    if (this.shouldPersistExtremums) {
      this.shouldPersistExtremums = false
      this.cache.points = [...defaultCache.points]
      this.cache.normalizedPoints = [...defaultCache.normalizedPoints]
    }
  }

  api: IExtremumsAPI = {
    persist: this.persistExtremums,
    unpersist: this.unpersistExtremums,
  }

  getNormalizedPoints = (
    points: IPoints,
    duration: IDuration,
    extremums: IExtremums,
  ): INormalizedPoints => {
    const sameDurationAndExtremums =
      duration === this.cache.duration && extremums === this.cache.extremums

    if (sameDurationAndExtremums && points === this.cache.points) {
      return this.cache.normalizedPoints
    }

    const normalizeTime = getTimeNormalizer(duration)
    const normalizeValue = getValueNormalizer(extremums)
    const normalizedPoints = points.map((point, index) => {
      if (sameDurationAndExtremums && point === this.cache.points[index]) {
        return this.cache.normalizedPoints[index]
      }

      const {time, value, interpolationDescriptor} = point
      return {
        originalTime: time,
        originalValue: value,
        time: normalizeTime(time),
        value: normalizeValue(value),
        interpolationDescriptor: {...interpolationDescriptor},
      }
    })

    this.cache.points = points
    this.cache.normalizedPoints = normalizedPoints
    this.cache.duration = duration
    this.cache.extremums = extremums
    return normalizedPoints
  }

  getExtremums(points: IPoints) {
    if (this.shouldPersistExtremums) {
      return this.cache.extremums
    }
    if (points === this.cache.points) {
      return this.cache.extremums
    }
    return this.calculateExtremums(points)
  }

  calculateExtremums = (points: IPoints): IExtremums => {
    let extremums: IExtremums
    if (points.length === 0) {
      extremums = [-5, 5]
    } else {
      let min: number = Infinity,
        max: number = -Infinity
      points.forEach((point, index) => {
        const nextPointValue =
          points[index + 1] != null ? points[index + 1].value : undefined
        ;[min, max] = getMinAndMax(
          min,
          max,
          point.value,
          nextPointValue,
          point.interpolationDescriptor.handles,
        )
      })
      if (min === max) {
        min -= 5
        max += 5
      }
      extremums = [min, max]
    }
    return extremums
  }
}

export const getTimeNormalizer = (duration: number) => {
  const durationFactor = 100 / duration
  return (time: number) => time * durationFactor
}

export const getValueNormalizer = (extremums: IExtremums) => {
  const upperExtremum = extremums[1]
  const diffFactor = 100 / (extremums[1] - extremums[0])
  return (value: number) => (upperExtremum - value) * diffFactor
}

export const calculateNextExtremums = (
  points: INormalizedPoints,
): IExtremums => {
  let min: number = Infinity,
    max: number = -Infinity
  points.forEach((point, index) => {
    const nextPointValue =
      points[index + 1] != null ? points[index + 1].originalValue : undefined
    ;[min, max] = getMinAndMax(
      min,
      max,
      point.originalValue,
      nextPointValue,
      point.interpolationDescriptor.handles,
    )
  })
  if (min === max) {
    min -= 5
    max += 5
  }
  return [min, max]
}

const getMinAndMax = (
  min: number,
  max: number,
  pointValue: number,
  nextPointValue: undefined | number,
  pointHandles: IPointHandles,
): INumberTuple => {
  let candids = [pointValue]
  if (nextPointValue != null) {
    candids = candids.concat(
      pointValue + pointHandles[1] * (nextPointValue - pointValue),
      nextPointValue + pointHandles[3] * (pointValue - nextPointValue),
    )
  }
  const localMin = Math.min(...candids)
  const localMax = Math.max(...candids)
  min = Math.min(min, localMin)
  max = Math.max(max, localMax)

  return [min, max]
}

export default ItemPointsNormalizer
