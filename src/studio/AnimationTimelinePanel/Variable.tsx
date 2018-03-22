import React from 'react'
import Point from './Point'
import Connector from './Connector'
import {NormalizedPoint} from '$studio/AnimationTimelinePanel/types'

type Props = {
  variableId: string
  points: NormalizedPoint[]
  extremums: $FixMe
  color: {name: string; normal: string; darkened: string}
  getSvgSize: Function
  getDuration: Function
  showPointValuesEditor: Function
  showContextMenuForPoint: Function
  showContextMenuForConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  addConnector: Function
  removeConnector: Function
  makeHandleHorizontal: Function
}

interface IState {
  points: $FixMe
}

class Variable extends React.PureComponent<Props, IState> {
  constructor(props: Props) {
    super(props)

    this.state = {
      points: this._getNormalizedPoints(props.points, props.extremums),
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // const {extremums} = this.props
    // const {extremums: nextExtremums} = nextProps
    // console.log(extremums === nextExtremums)
    // if (extremums[0] !== nextExtremums[0] || extremums[1] !== nextExtremums[1]) {
    //   this.setState(() => ({
    //     points: this._getNormalizedPoints(nextProps.points, nextExtremums)
    //   }))
    // }
    if (nextProps.extremums !== this.props.extremums) {
      this.setState(() => ({
        points: this._getNormalizedPoints(
          nextProps.points,
          nextProps.extremums,
        ),
      }))
    }
  }

  _getNormalizedPoints(points: $FixMe, extremums: $FixMe) {
    const extDiff = extremums[1] - extremums[0]
    const duration = this.props.getDuration()
    return points.map((point: $FixMe) => {
      const {time, value, interpolationDescriptor} = point
      return {
        _t: time,
        _value: value,
        time: time / duration * 100,
        value: (extremums[1] - value) / extDiff * 100,
        interpolationDescriptor: {...interpolationDescriptor},
      }
    })
  }

  showPointValuesEditor = (pointIndex: number, params: $FixMe) => {
    this.props.showPointValuesEditor(this.props.variableId, pointIndex, params)
  }

  showContextMenuForPoint = (
    pointIndex: number,
    pos: {left: number; top: number},
  ) => {
    this.props.showContextMenuForPoint(this.props.variableId, pointIndex, pos)
  }

  showContextMenuForConnector = (
    pointIndex: number,
    pos: {left: number; top: number},
  ) => {
    this.props.showContextMenuForConnector(
      this.props.variableId,
      pointIndex,
      pos,
    )
  }

  changePointPositionBy = (
    pointIndex: number,
    change: {time: number; value: number},
  ) => {
    this.props.changePointPositionBy(this.props.variableId, pointIndex, change)
  }

  changePointHandlesBy = (
    pointIndex: number,
    change: [number, number, number, number],
  ) => {
    this.props.changePointHandlesBy(this.props.variableId, pointIndex, change)
  }

  removePoint = (pointIndex: number) => {
    this.props.removePoint(this.props.variableId, pointIndex)
  }

  addConnector = (pointIndex: number) => {
    this.props.addConnector(this.props.variableId, pointIndex)
  }

  removeConnector = (pointIndex: number) => {
    this.props.removeConnector(this.props.variableId, pointIndex)
  }

  makeHandleHorizontal = (pointIndex: number, side: 'left' | 'right') => {
    this.props.makeHandleHorizontal(this.props.variableId, pointIndex, side)
  }

  render() {
    const {color} = this.props
    const {points} = this.state
    return (
      <g fill={color.normal} stroke={color.normal}>
        {points.map((point: $FixMe, index: number) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          return (
            <g key={index}>
              {point.interpolationDescriptor.connected &&
                nextPoint != null && (
                  <Connector
                    leftPointIndex={index}
                    leftPointTime={point.time}
                    leftPointValue={point.value}
                    rightPointTime={nextPoint.time}
                    rightPointValue={nextPoint.value}
                    handles={point.interpolationDescriptor.handles}
                    removeConnector={this.removeConnector}
                    showContextMenu={this.showContextMenuForConnector}
                  />
                )}
              <Point
                color={color}
                key={`${point._value}${point._t}`}
                {...(prevPoint
                  ? {
                      prevPointTime: prevPoint.time,
                      prevPointValue: prevPoint.value,
                      prevPointHandles:
                        prevPoint.interpolationDescriptor.handles,
                      prevPointConnected:
                        prevPoint.interpolationDescriptor.connected,
                    }
                  : {})}
                {...(nextPoint
                  ? {
                      nextPointTime: nextPoint.time,
                      nextPointValue: nextPoint.value,
                    }
                  : {})}
                pointTime={point.time}
                pointValue={point.value}
                pointHandles={point.interpolationDescriptor.handles}
                pointConnected={point.interpolationDescriptor.connected}
                pointAbsoluteTime={point._t}
                pointAbsoluteValue={point._value}
                pointIndex={index}
                getSvgSize={this.props.getSvgSize}
                showPointValuesEditor={this.showPointValuesEditor}
                showContextMenu={this.showContextMenuForPoint}
                changePointPositionBy={this.changePointPositionBy}
                changePointHandlesBy={this.changePointHandlesBy}
                removePoint={this.removePoint}
                addConnector={this.addConnector}
                makeHandleHorizontal={this.makeHandleHorizontal}
              />
            </g>
          )
        })}
      </g>
    )
  }
}

export default Variable
