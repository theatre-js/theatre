import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import UIComponent from '$tl/ui/handy/UIComponent'
import {DurationContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import {
  TPoints,
  TNormalizedPoints,
  TExtremums,
  TDuration,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import noop from '$shared/utils/noop'

interface IProps {
  points: TPoints
  children: (
    normalizedPoints: TNormalizedPoints,
    extremums: TExtremums,
    duration: TDuration,
  ) => React.ReactChild
}

interface IState {}

export type TExtremumsAPI = {
  persist: () => void
  unpersist: () => void
}

export const ExtremumsAPIContext = React.createContext<TExtremumsAPI>({
  persist: noop,
  unpersist: noop,
})

type TCache = {
  extremums: TExtremums
  duration: TDuration
  points: TPoints
  normalizedPoints: TNormalizedPoints
}

const defaultCache: TCache = {
  extremums: [-5, 5],
  duration: 0,
  normalizedPoints: [],
  points: [],
}

class ItemPointsNormalizer extends UIComponent<IProps, IState> {
  shouldPersistExtremums: boolean = false
  cache: TCache = {...defaultCache}

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const points = val(propsP.points)
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

                  return this.props.children(
                    normalizedPoints,
                    extremums,
                    duration,
                  )
                }}
              </DurationContext.Consumer>
            </ExtremumsAPIContext.Provider>
          )
        }}
      </PropsAsPointer>
    )
  }

  persistExtremums: TExtremumsAPI['persist'] = () => {
    this.shouldPersistExtremums = true
  }

  unpersistExtremums: TExtremumsAPI['unpersist'] = () => {
    this.shouldPersistExtremums = false
    this.cache = {...defaultCache}
  }

  api: TExtremumsAPI = {
    persist: this.persistExtremums,
    unpersist: this.unpersistExtremums,
  }

  getNormalizedPoints = (
    points: TPoints,
    duration: TDuration,
    extremums: TExtremums,
  ): TNormalizedPoints => {
    const sameDurationAndExtremums =
      duration === this.cache.duration && extremums === this.cache.extremums

    if (sameDurationAndExtremums && points === this.cache.points) {
      return this.cache.normalizedPoints
    }

    const extDiff = extremums[1] - extremums[0]
    const normalizedPoints = points.map((point, index) => {
      if (sameDurationAndExtremums && point === this.cache.points[index]) {
        return this.cache.normalizedPoints[index]
      }

      const {time, value, interpolationDescriptor} = point
      return {
        originalTime: time,
        originalValue: value,
        time: (time / duration) * 100,
        value: ((extremums[1] - value) / extDiff) * 100,
        interpolationDescriptor: {...interpolationDescriptor},
      }
    })

    this.cache.points = points
    this.cache.normalizedPoints = normalizedPoints
    this.cache.duration = duration
    return normalizedPoints
  }

  getExtremums(points: TPoints) {
    if (this.shouldPersistExtremums) {
      return this.cache.extremums
    }
    if (points === this.cache.points) {
      return this.cache.extremums
    }
    return this.calculateExtremums(points)
  }

  calculateExtremums = (points: TPoints): TExtremums => {
    let extremums: TExtremums
    if (points.length === 0) {
      extremums = [-5, 5]
    } else {
      let min: number = Infinity,
        max: number = -Infinity
      points.forEach((point, index) => {
        const {value} = point
        const nextPoint = points[index + 1]
        let candids = [value]
        if (nextPoint != null) {
          candids = candids.concat(
            value +
              point.interpolationDescriptor.handles[1] *
                (nextPoint.value - value),
            nextPoint.value +
              point.interpolationDescriptor.handles[3] *
                (value - nextPoint.value),
          )
        }
        const localMin = Math.min(...candids)
        const localMax = Math.max(...candids)
        min = Math.min(min, localMin)
        max = Math.max(max, localMax)
      })
      if (min === max) {
        min -= 5
        max += 5
      }
      extremums = [min, max]
    }
    this.cache.extremums = extremums
    return extremums
  }
}

export default ItemPointsNormalizer
