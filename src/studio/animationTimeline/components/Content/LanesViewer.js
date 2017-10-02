// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {getLanesByIds} from '$studio/animationTimeline/selectors'
import {
  addPointToLane,
  removePointFromLane,
  setPointPositionTo,
  changePointPositionBy,
  changePointHandlesBy,
  addConnector,
  removeConnector,
  makeHandleHorizontal,
  makeHandlesParallel,
  makeHandlesEqual} from '$studio/animationTimeline/sagas'
import {type LaneID, type LaneObject, type Point, type PointPosition, type PointHandles, type NormalizedPoint} from '$studio/animationTimeline/types'
import {type StoreState} from '$studio/types'
import css from './LanesViewer.css'
import Lane from './Lane'
import cx from 'classnames'

type OwnProps = {
  laneIds: LaneID[],
  splitLane: Function,
  panelWidth: number,
  duration: number,
  currentTime: number,
  focus: [number, number],
  boxHeight: number,
}

type Props = WithRunSagaProps & OwnProps & {
  lanes: LaneObject[],
}

type State = {
  svgWidth: number,
  svgHeight: number,
  svgTransform: number,
  svgExtremums: [number, number],
  activeLaneId: string,
}

class LanesViewer extends React.PureComponent<Props, State> {
  svgArea: HTMLElement

  // ??
  static colors = ['darkturquoise', 'orchid', 'mediumspringgreen', 'gold']

  constructor(props: Props) {
    super(props)

    this.state = {
      ...this._getSvgState(props),
      activeLaneId: props.laneIds[0],
    }
  }

  componentWillReceiveProps(newProps) {
    let activeLaneId = this.state.activeLaneId
    if (newProps.laneIds.find((id) => (id === activeLaneId)) == null) {
      activeLaneId = newProps.laneIds[0]
    }
    this.setState(() => ({...this._getSvgState(newProps), activeLaneId}))
  }

  titleClickHandler(e: SyntheticMouseEvent<>, laneId: string) {
    if (e.altKey) {
      return this.props.splitLane(laneId)
    }
    this.setActiveLane(laneId)
  }

  setActiveLane(activeLaneId: string) {
    this.setState(() => ({activeLaneId}))
  }

  _getSvgState(props) {
    const {boxHeight, duration, focus, panelWidth, lanes} = props
    const svgHeight = boxHeight - 14
    const svgWidth = duration / (focus[1] - focus[0]) * (panelWidth)
    const svgTransform = svgWidth * focus[0] / duration
    const svgExtremums = lanes.reduce((reducer, {extremums}) => {
      if (extremums[0] < reducer[0]) reducer[0] = extremums[0]
      if (extremums[1] > reducer[1]) reducer[1] = extremums[1]
      return reducer
    }, [0, 0])
    
    return {svgHeight, svgWidth, svgTransform, svgExtremums}
  }

  addPoint = (e: SyntheticMouseEvent<>) => {
    if (!(e.ctrlKey || e.metaKey)) return
    const {top, left} = this.svgArea.getBoundingClientRect()
    const t = e.clientX - left
    const value = e.clientY - top
    const handleLength = (this.props.focus[1] - this.props.focus[0]) / 30
    const pointProps: Point = {
      t: this._deNormalizeX(t),
      value: this._deNormalizeValue(value),
      handles: [-handleLength, 0, handleLength, 0],
      isConnected: true,
    }
    this.props.runSaga(addPointToLane, this.state.activeLaneId, pointProps)
  }

  removePoint = (laneId: LaneID, pointIndex: number) => {
    this.props.runSaga(removePointFromLane, laneId, pointIndex)
  }

  setPointPositionTo = (laneId: LaneID, pointIndex: number, newPosition: PointPosition) => {
    this.props.runSaga(setPointPositionTo, laneId, pointIndex, newPosition)
  }

  changePointPositionBy = (laneId: LaneID, pointIndex: number, change: PointPosition) => {
    this.props.runSaga(changePointPositionBy, laneId, pointIndex, this.deNormalizePositionChange(change))
  }

  changePointHandlesBy = (laneId: LaneID, pointIndex: number, change: PointHandles) => {
    this.props.runSaga(changePointHandlesBy, laneId, pointIndex, this.deNormalizeHandles(change))
  }
  
  addConnector = (laneId: LaneID, pointIndex: number) => {
    this.props.runSaga(addConnector, laneId, pointIndex)
  }

  removeConnector = (laneId: LaneID, pointIndex: number) => {
    this.props.runSaga(removeConnector, laneId, pointIndex)
  }
  
  makeHandleHorizontal = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.runSaga(makeHandleHorizontal, laneId, pointIndex, side)
  }

  makeHandlesParallel = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.runSaga(makeHandlesParallel, laneId, pointIndex, side)
  }

  makeHandlesEqual = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.runSaga(makeHandlesEqual, laneId, pointIndex, side)
  }

  _normalizeX(x: number) {
    return x * this.state.svgWidth / this.props.duration
  }

  _deNormalizeX(x: number) {
    return x * this.props.duration / this.state.svgWidth
  }

  _normalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return - y * svgHeight / (svgExtremums[1] - svgExtremums[0])
  }

  _deNormalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return - y * (svgExtremums[1] - svgExtremums[0]) / svgHeight
  }

  _normalizeValue(value: number) {
    return this._normalizeY(value - this.state.svgExtremums[1])
  }

  _deNormalizeValue(value: number) {
    return this.state.svgExtremums[1] + this._deNormalizeY(value)
  }

  normalizePositionChange = (position: PointPosition): PointPosition => {
    return {
      t: this._normalizeX(position.t),
      value: this._normalizeY(position.value),
    }
  }

  deNormalizePositionChange = (position: PointPosition): PointPosition => {
    return {
      t: this._deNormalizeX(position.t),
      value: this._deNormalizeY(position.value),
    }
  }

  _normalizeHandles = (handles: PointHandles): PointHandles => {
    return [
      this._normalizeX(handles[0]),
      this._normalizeY(handles[1]),
      this._normalizeX(handles[2]),
      this._normalizeY(handles[3]),
    ]
  }

  deNormalizeHandles = (handles: PointHandles): PointHandles => {
    return [
      this._deNormalizeX(handles[0]),
      this._deNormalizeY(handles[1]),
      this._deNormalizeX(handles[2]),
      this._deNormalizeY(handles[3]),
    ]
  }

  _normalizePoints(points: Point[]): NormalizedPoint[] {
    return points.map((point) => {
      const {t, value, handles, isConnected} = point
      return {
        _t: t,
        _value: value,
        t: this._normalizeX(t),
        value: this._normalizeValue(value),
        handles: this._normalizeHandles(handles),
        isConnected,
      }
    })
  }

  render() {
    const {lanes} = this.props
    const {svgHeight, svgWidth, svgTransform, activeLaneId} = this.state
    const multiLanes = (lanes.length > 1)
    return (
      <div className={css.container}>
        <div className={css.titleBar}>
          {lanes.map(({id, component, property}, index) => (
            <div
              key={id}
              className={cx(css.title, {[css.activeTitle]: multiLanes && id === activeLaneId})}
              {...(multiLanes ? {onClick: (e) => this.titleClickHandler(e, id)} : {})}>
              <div className={css.componentName}>{component}</div>
              <div className={css.propertyName} style={{color: LanesViewer.colors[index%4]}}>{property}</div>
            </div>
          ))
          }
        </div>
        <div className={css.svgArea}>
          <svg
            height={svgHeight}
            width={svgWidth}
            style={{transform: `translateX(${-svgTransform}px)`}}
            ref={(svg) => {if (svg != null) this.svgArea = svg}}
            onClick={this.addPoint}>
            {
              lanes.map(({id, points}, index) => (
                <Lane
                  key={id}
                  laneId={id}
                  points={this._normalizePoints(points)}
                  color={LanesViewer.colors[index%4]}
                  width={svgWidth}
                  changePointPositionBy={(index, change) => this.changePointPositionBy(id, index, change)}
                  changePointHandlesBy={(index, change) => this.changePointHandlesBy(id, index, change)}
                  setPointPositionTo={(index, newPosition) => this.setPointPositionTo(id, index, newPosition)}
                  removePoint={(index) => this.removePoint(id, index)}
                  addConnector={(index) => this.addConnector(id, index)}
                  removeConnector={(index) => this.removeConnector(id, index)}
                  makeHandleHorizontal={(index, side) => this.makeHandleHorizontal(id, index, side)}
                  makeHandlesEqual={(index, side) => this.makeHandlesEqual(id, index, side)}
                  makeHandlesParallel={(index, side) => this.makeHandlesParallel(id, index, side)}/>
              ))
            }
          </svg>
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: StoreState, ownProps: OwnProps) => {
      return {
        lanes: getLanesByIds(state, ownProps.laneIds),
      }
    }
  ),
  withRunSaga(),
)(LanesViewer)