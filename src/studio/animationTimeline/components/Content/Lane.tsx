// @flow
import React from 'react'
import Point from './Point'
import Connector from './Connector'
import {NormalizedPoint} from '$studio/animationTimeline/types'

type Props = {
  laneId: string
  points: NormalizedPoint[]
  color: string
  width: number
  changePointPositionBy: Function
  changePointHandlesBy: Function
  setPointPositionTo: Function
  removePoint: Function
  addConnector: Function
  removeConnector: Function
  makeHandleHorizontal: Function
}

class Lane extends React.PureComponent<Props, {}> {
  render() {
    const {points, color, width} = this.props
    return (
      <g fill={color} stroke={color}>
        {points.map((point, index) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          return (
            <g key={index}>
              {point.isConnected &&
                nextPoint != null && (
                  <Connector
                    leftPoint={point}
                    rightPoint={nextPoint}
                    removeConnector={() => this.props.removeConnector(index)}
                  />
                )}
              <Point
                key={index}
                prevPoint={prevPoint}
                nextPoint={nextPoint}
                point={point}
                laneWidth={width}
                showPointValuesEditor={(pos: {left: number, top: number}) =>
                  this.props.showPointValuesEditor(index, pos)  
                }
                changePointPositionBy={change =>
                  this.props.changePointPositionBy(index, change)
                }
                changePointHandlesBy={change =>
                  this.props.changePointHandlesBy(index, change)
                }
                setPointPositionTo={newPosition =>
                  this.props.setPointPositionTo(index, newPosition)
                }
                addConnector={() => this.props.addConnector(index)}
                removePoint={() => this.props.removePoint(index)}
                makeHandleHorizontal={side =>
                  this.props.makeHandleHorizontal(index, side)
                }
              />
            </g>
          )
        })}
      </g>
    )
  }
}

export default Lane
