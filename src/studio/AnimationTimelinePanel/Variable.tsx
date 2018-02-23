import React from 'react'
import Point from './Point'
import Connector from './Connector'
import {NormalizedPoint} from '$studio/animationTimeline/types'
import {isEqual} from 'lodash'

type Props = {
  variableId: string
  points: NormalizedPoint[]
  color: string
  // width: number
  getSvgSize: Function
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

class Variable extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps, this.props)
  }

  showPointValuesEditor = (pointIndex: number, params: $FixMe) => {
    this.props.showPointValuesEditor(this.props.variableId, pointIndex, params)
  }

  showContextMenuForPoint = (pointIndex: number, pos: {left: number, top: number}) => {
    this.props.showContextMenuForPoint(this.props.variableId, pointIndex, pos)
  }

  showContextMenuForConnector = (pointIndex: number, pos: {left: number, top: number}) => {
    this.props.showContextMenuForConnector(this.props.variableId, pointIndex, pos)
  }

  changePointPositionBy = (pointIndex: number, change: {time: number, value: number}) => {
    this.props.changePointPositionBy(this.props.variableId, pointIndex, change)
  }

  changePointHandlesBy = (pointIndex: number, change: [number, number, number, number]) => {
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
    // const {points, color, width} = this.props
    const {points, color} = this.props
    return (
      <g fill={color.normal} stroke={color.normal}>
        {points.map((point, index) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          return (
            <g key={index}>
              {point.interpolationDescriptor.connected &&
                nextPoint != null && (
                  <Connector
                    pointIndex={index}
                    leftPoint={point}
                    rightPoint={nextPoint}
                    removeConnector={this.removeConnector}
                    showContextMenu={this.showContextMenuForConnector}
                  />
                )}
              <Point
                color={color}
                key={index}
                prevPoint={prevPoint}
                nextPoint={nextPoint}
                point={point}
                // variableWidth={width}
                getSvgSize={this.props.getSvgSize}
                pointIndex={index}
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
