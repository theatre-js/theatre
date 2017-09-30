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

type State = $FlowFixMe

class Lane extends React.PureComponent<Props, State> {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
  }

  _normalizePointProps(point: $FlowFixMe) {
    if (point == null) return point
    return {
      originalT: point.t,
      originalValue: point.value,
      ...this.props.normalizePointProps(point),
    }
  }

  render() {
    const {points, color, updatePointProps, removePointFromLane, addConnector, removeConnector} = this.props
    return (
      <g fill={color} stroke={color}>
        {
          points.map((point, index) => {
            const normPoint = this._normalizePointProps(point)
            const normPrevPoint = this._normalizePointProps(points[index - 1])
            const normNextPoint = this._normalizePointProps(points[index + 1])
            const {id, isConnected} = point
            return (
              <g key={id}>
                {isConnected && normNextPoint &&
                  <Connector
                    leftPoint={normPoint}
                    rightPoint={normNextPoint}
                    removeConnector={() => removeConnector(index)}/>
                }
                <Point
                  key={id}
                  prevPoint={normPrevPoint}
                  nextPoint={normNextPoint}
                  point={normPoint}
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
}

export default Lane