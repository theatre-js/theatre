import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import memoizeOne from 'memoize-one'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import UIComponent from '$tl/ui/handy/UIComponent'
import {DurationContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/RootPropProvider'
import {
  TPoints,
  TNormalizedPoints,
  TExtremums,
  TDuration,
} from '$tl/ui/panels/AllInOnePanel/Right/types'

interface IProps {
  points: TPoints
  children: (
    normalizedPoints: TNormalizedPoints,
    extremums: TExtremums,
    duration: TDuration,
  ) => React.ReactChild
}

interface IState {}

class ItemPointsNormalizer extends UIComponent<IProps, IState> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const points = val(propsP.points)
          const extremums = this.getExtremums(points)

          return (
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
          )
        }}
      </PropsAsPointer>
    )
  }

  getNormalizedPoints = memoizeOne(
    (
      points: TPoints,
      duration: number,
      extremums: TExtremums,
    ): TNormalizedPoints => {
      const extDiff = extremums[1] - extremums[0]
      return points.map(point => {
        const {time, value, interpolationDescriptor} = point
        return {
          originalTime: time,
          originalValue: value,
          time: (time / duration) * 100,
          value: ((extremums[1] - value) / extDiff) * 100,
          interpolationDescriptor: {...interpolationDescriptor},
        }
      })
    },
  )

  getExtremums = memoizeOne(
    (points: TPoints): TExtremums => {
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

      return extremums
    },
  )
}

export default ItemPointsNormalizer
