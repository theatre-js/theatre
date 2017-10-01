// @flow
import React from 'react'
import Point from './Point'
import Connector from './Connector'

type Props = {
  laneId: string,
  points: Object,
  color: string,
  normalizePointProps: Function,
  updatePointProps: Function,
  removePointFromLane: Function,
  addConnector: Function,
  removeConnector: Function,
}

const Lane = (props: Props) => {
  const {points, color, normalizePointProps, updatePointProps, removePointFromLane, addConnector, removeConnector} = props
  return (
    <g fill={color} stroke={color}>
      {
        points.map((point, index) => {
          const normPoint = normalizePointProps(point)
          const normPrevPoint = points[index - 1] && normalizePointProps(points[index - 1])
          const normNextPoint = points[index + 1] && normalizePointProps(points[index + 1])
          const {isConnected} = point
          return (
            <g key={index}>
              {isConnected && normNextPoint &&
                <Connector
                  leftPoint={normPoint}
                  rightPoint={normNextPoint}
                  removeConnector={() => removeConnector(index)}/>
              }
              <Point
                key={index}
                prevPoint={normPrevPoint}
                nextPoint={normNextPoint}
                point={normPoint}
                originalT={point.t}
                originalValue={point.value}
                updatePointProps={(newProps) => updatePointProps(index, newProps)}
                removePoint={() => removePointFromLane(index)}
                addConnector={() => addConnector(index)}/>
            </g>
          )
        })
      }
    </g>
  )
}

export default Lane