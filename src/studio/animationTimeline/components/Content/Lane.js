// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {updatePointProps, removePointFromLane} from '$studio/animationTimeline/sagas'
import PointAndConnector from './PointAndConnector'

type Props = WithRunSagaProps & {
  laneId: string,
  points: Object,
  color: string,
}

type State = $FlowFixMe

class Lane extends React.PureComponent {
  props: Props
  state: State

  constructor(props: Props) {
    super(props)
  }

  pointClickHandler = (point) => {
    console.log('point', point)
  }

  connectorClickHandler = (point) => {
    console.log('connector', point)
  }

  updatePointProps = (index: number, newProps: Object) => {
    this.props.runSaga(updatePointProps, this.props.laneId, index, newProps)
  }

  removePointFromLane = (index: number) => {
    this.props.runSaga(removePointFromLane, this.props.laneId, index)
  }

  render() {
    const {points, color} = this.props
    return (
      <g fill={color} stroke={color}>
        {
          points.map((point, index) => {
            return (
              <PointAndConnector
                key={point.id}
                point={point}
                prevPoint={points[index - 1] || {t: 0}}
                nextPoint={points[index + 1] || {t: 420}}
                updatePointProps={(newProps) => this.updatePointProps(index, newProps)}
                removePointFromLane={() => this.removePointFromLane(index)}/>
            )
          })
        }
      </g>
    )
  }
}

export default compose (withRunSaga())(Lane)