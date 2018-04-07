import React from 'react'
import Point from './Point'
import Connector from './Connector'
import {NormalizedPoint} from '$studio/AnimationTimelinePanel/types'
import {svgPaddingY} from './BoxView'

type Props = {
  variableId: string
  points: NormalizedPoint[]
  color: {name: string; normal: string; darkened: string}
  getSvgSize: Function
  getDuration: Function
  addPoint: Function
  showPointValuesEditor: Function
  showContextMenuForPoint: Function
  showContextMenuForConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  addConnector: Function
  removeConnector: Function
  makeHandleHorizontal: Function
  addPointToSelection: Function
  removePointFromSelection: Function
}

interface IState {
  points: $FixMe
}

class Variable extends React.PureComponent<Props, IState> {
  extremums: [number, number]

  constructor(props: Props) {
    super(props)

    this.extremums = this._getExtremums(props.points)
    this.state = {
      points: this._getNormalizedPoints(props.points),
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.points !== nextProps.points) {
      this.extremums = this._getExtremums(nextProps.points)
      this.setState(() => ({
        points: this._getNormalizedPoints(nextProps.points),
      }))
    }
  }

  _getNormalizedPoints(points: $FixMe) {
    const extDiff = this.extremums[1] - this.extremums[0]
    const duration = this.props.getDuration()
    return points.map((point: $FixMe) => {
      const {time, value, interpolationDescriptor} = point
      return {
        _t: time,
        _value: value,
        time: time / duration * 100,
        value: (this.extremums[1] - value) / extDiff * 100,
        interpolationDescriptor: {...interpolationDescriptor},
      }
    })
  }

  _getExtremums(points: $FixMe): [number, number] {
    if (points.length === 0) return [-5, 5]

    let min, max
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
      min = min == null ? localMin : Math.min(min, localMin)
      max = max == null ? localMax : Math.max(max, localMax)
    })
    if (min === max) {
      min -= 5
      max += 5
    }

    return [min, max]
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
    this.props.changePointPositionBy(
      this.props.variableId,
      pointIndex,
      change,
      this.extremums,
    )
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

  mouseDownHandler = (e: $FixMe) => {
    // e.stopPropagation()
    this.props.addPoint(
      this.props.variableId,
      this.extremums,
      e,
    )
  }

  addPointToSelection = (pointIndex: number, pointData: Object) => {
    this.props.addPointToSelection(this.props.variableId, this.extremums, pointIndex, pointData)
  }

  removePointFromSelection = (pointIndex: number) => {
    this.props.removePointFromSelection(this.props.variableId, pointIndex)
  }

  render() {
    const {color} = this.props
    const {points} = this.state
    return [
      <rect
        key="hit-zone"
        fill="transparent"
        width="100%"
        y={-svgPaddingY / 2}
        style={{height: `calc(100% + ${svgPaddingY}*1px)`}}
        onMouseDown={this.mouseDownHandler}
      />,
      <g key="variable" fill={color.normal} stroke={color.normal}>
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
                addPointToSelection={this.addPointToSelection}
                removePointFromSelection={this.removePointFromSelection}
              />
            </g>
          )
        })}
      </g>,
    ]
  }
}

export default Variable
