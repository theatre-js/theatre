// @flow
import React from 'react'
import Point from './Point'
import Connector from './Connector'
import {type NormalizedPoint} from '$studio/animationTimeline/types'

type Props = {
  laneId: string,
  points: NormalizedPoint[],
  color: string,
  changePointPositionBy: Function,
  changePointHandlesBy: Function,
  setPointPositionTo: Function,
  removePoint: Function,
  addConnector: Function,
  removeConnector: Function,
  makeHandleHorizontal: Function,
  makeHandlesEqual: Function,
  makeHandlesParallel: Function,
}

const Lane = (props: Props) => {
  const {points, color} = props
  return (
    <g fill={color} stroke={color}>
      {
        points.map((point, index) => {
          const prevPoint = points[index - 1]
          const nextPoint = points[index + 1]
          const {isConnected} = point
          return (
            <g key={index}>
              {isConnected && (nextPoint != null) &&
                <Connector
                  leftPoint={point}
                  rightPoint={nextPoint}
                  removeConnector={() => props.removeConnector(index)}/>
              }
              <Point
                key={index}
                prevPoint={prevPoint}
                nextPoint={nextPoint}
                point={point}
                changePointPositionBy={(change) => props.changePointPositionBy(index, change)}
                changePointHandlesBy={(change) => props.changePointHandlesBy(index, change)}
                setPointPositionTo={(newPosition) => props.setPointPositionTo(index, newPosition)}
                addConnector={() => props.addConnector(index)}
                removePoint={() => props.removePoint(index)}
                makeHandleHorizontal={(side) => props.makeHandleHorizontal(index, side)}
                makeHandlesEqual={(side) => props.makeHandlesEqual(index, side)}
                makeHandlesParallel={(side) => props.makeHandlesParallel(index, side)}/>
            </g>
          )
        })
      }
    </g>
  )
}

export default Lane