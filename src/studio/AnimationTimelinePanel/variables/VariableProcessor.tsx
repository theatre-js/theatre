import React from 'react'
import {
  TPoint,
  TNormalizedPoint,
  VariableID,
} from '$studio/AnimationTimelinePanel/types'
import {Subscriber} from 'react-broadcast'
import {DurationChannel} from '$studio/AnimationTimelinePanel/RootPropProvider'
import {Pointer} from '$shared/DataVerse2/pointer'
import {val} from '$shared/DataVerse2/atom'
import {get} from '$shared/utils'
import memoizeOne from 'memoize-one'
import PureComponentWithTheater from '$studio/handy/PureComponentWithTheater'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'

interface IProps {
  pathToTimeline: string[]
  variableId: VariableID
  children: (
    normalizedPoints: TNormalizedPoint[],
    extremums: [number, number],
    duration: number,
  ) => React.ReactChild
}

interface IState {}

class VariableProcessor extends PureComponentWithTheater<IProps, IState> {
  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props}) => {
          const {pathToTimeline, variableId} = val(props)
          const points: TPoint[] = val(get(
            this.studio.atom2.pointer,
            pathToTimeline.concat('variables', variableId, 'points'),
          ) as Pointer<TPoint[]>)
          const extremums = this.getExtremums(points)

          return (
            <Subscriber channel={DurationChannel}>
              {(duration: number) => {
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
            </Subscriber>
          )
        }}
      </PropsAsPointer>
    )
  }

  getNormalizedPoints = memoizeOne(
    (
      points: TPoint[],
      duration: number,
      extremums: [number, number],
    ): TNormalizedPoint[] => {
      const extDiff = extremums[1] - extremums[0]
      return points.map((point: TPoint) => {
        const {time, value, interpolationDescriptor} = point
        return {
          _t: time,
          _value: value,
          time: (time / duration) * 100,
          value: ((extremums[1] - value) / extDiff) * 100,
          interpolationDescriptor: {...interpolationDescriptor},
        }
      })
    },
  )

  getExtremums = memoizeOne(
    (points: TPoint[]): [number, number] => {
      let extremums: [number, number]
      if (points.length === 0) {
        extremums = [-5, 5]
      } else {
        let min: number = Infinity,
          max: number = -Infinity
        points.forEach((point: TPoint, index: number) => {
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

export default VariableProcessor
