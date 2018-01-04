// @flow
import {React, connect, reduceStateAction} from '$studio/handy'
import {getLanesByIds} from '$studio/animationTimeline/selectors'
import {
  type LaneID,
  type LaneObject,
  type Point,
  type PointPosition,
  type PointHandles,
  type NormalizedPoint,
} from '$studio/animationTimeline/types'
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

type Props = OwnProps & {
  lanes: LaneObject[],
  dispatch: Function,
}

type State = {
  svgWidth: number,
  svgHeight: number,
  svgTransform: number,
  svgExtremums: [number, number],
  activeLaneId: string,
}

const resetExtremums = laneId => {
  return reduceStateAction(
    ['animationTimeline', 'lanes', 'byId', laneId],
    lane => {
      const {points} = lane
      if (points.length === 0) return lane
      const newExtremums = points.reduce(
        (reducer, point) => {
          const {value, handles} = point
          return [
            Math.min(
              reducer[0],
              Math.min(value, value + handles[1], value + handles[3]) - 10,
            ),
            Math.max(
              reducer[1],
              Math.max(value, value + handles[1], value + handles[3]) + 10,
            ),
          ]
        },
        [0, 60],
      )
      return {
        ...lane,
        extremums: newExtremums,
      }
    }
  )
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
    if (newProps.laneIds.find(id => id === activeLaneId) == null) {
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
    const svgWidth = duration / (focus[1] - focus[0]) * panelWidth
    const svgTransform = svgWidth * focus[0] / duration
    const svgExtremums = lanes.reduce(
      (reducer, {extremums}) => {
        if (extremums[0] < reducer[0]) reducer[0] = extremums[0]
        if (extremums[1] > reducer[1]) reducer[1] = extremums[1]
        return reducer
      },
      [0, 0],
    )

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
      isConnected: true,
      handles: [-handleLength, 0, handleLength, 0],
    }
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', this.state.activeLaneId],
        lane => {
          const points = lane.points
          let atIndex = points.findIndex(point => point.t > pointProps.t)
          if (atIndex === -1) atIndex = points.length
          return {
            ...lane,
            points: points.slice(0, atIndex).concat(pointProps, points.slice(atIndex)),
          }
        }
      )
    )
    this.props.dispatch(resetExtremums(this.state.activeLaneId))
  }

  removePoint = (laneId: LaneID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points'],
        points =>
          points.slice(0, pointIndex).concat(points.slice(pointIndex + 1))
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  setPointPositionTo = (
    laneId: LaneID,
    pointIndex: number,
    newPosition: PointPosition,
  ) => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex],
        point => ({
          ...point,
          ...newPosition,
        })
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  changePointPositionBy = (laneId: LaneID, pointIndex: number, change: PointPosition) => {
    const deNormalizedChange = this.deNormalizePositionChange(change)
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex],
        point => ({
          ...point,
          t: point.t + deNormalizedChange.t,
          value: point.value + deNormalizedChange.value,
        })
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  changePointHandlesBy = (laneId: LaneID, pointIndex: number, change: PointHandles) => {
    const deNormalizedChange = this.deNormalizeHandles(change)
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex, 'handles'],
        handles => {
          return handles.map((handle, index) => handle + deNormalizedChange[index])
        }
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  addConnector = (laneId: LaneID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex],
        point => ({
          ...point,
          isConnected: true,
        }),
      )
    )
  }

  removeConnector = (laneId: LaneID, pointIndex: number) => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex],
        point => ({
          ...point,
          isConnected: false,
        }),
      )
    )
  }

  makeHandleHorizontal = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex, 'handles'],
        handles => {
          if (side === 'left') {
            handles[0] =
              Math.sign(handles[0]) *
              Math.sqrt(Math.pow(handles[0], 2) + Math.pow(handles[1], 2))
            handles[1] = 0
          }
          if (side === 'right') {
            handles[2] =
              Math.sign(handles[2]) *
              Math.sqrt(Math.pow(handles[2], 2) + Math.pow(handles[3], 2))
            handles[3] = 0
          }
          return handles
        }
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  makeHandlesParallel = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex, 'handles'],
        handles => {
          if (side === 'left') {
            const theta = Math.atan2(handles[3], handles[2]) + Math.PI
            const length = Math.sqrt(Math.pow(handles[0], 2) + Math.pow(handles[1], 2))
            handles[0] = length * Math.cos(theta)
            handles[1] = length * Math.sin(theta)
          }
          if (side === 'right') {
            const theta = Math.atan2(handles[1], handles[0]) + Math.PI
            const length = Math.sqrt(Math.pow(handles[2], 2) + Math.pow(handles[3], 2))
            handles[2] = length * Math.cos(theta)
            handles[3] = length * Math.sin(theta)
          }
          return handles
        }
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  makeHandlesEqual = (laneId: LaneID, pointIndex: number, side: 'left' | 'right') => {
    this.props.dispatch(
      reduceStateAction(
        ['animationTimeline', 'lanes', 'byId', laneId, 'points', pointIndex, 'handles'],
        handles => {
          if (side === 'left') {
            handles[0] = -handles[2]
            handles[1] = -handles[3]
          }
          if (side === 'right') {
            handles[2] = -handles[0]
            handles[3] = -handles[1]
          }
          return handles
        }
      )
    )
    this.props.dispatch(resetExtremums(laneId))
  }

  _normalizeX(x: number) {
    return x * this.state.svgWidth / this.props.duration
  }

  _deNormalizeX(x: number) {
    return x * this.props.duration / this.state.svgWidth
  }

  _normalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return -y * svgHeight / (svgExtremums[1] - svgExtremums[0])
  }

  _deNormalizeY(y: number) {
    const {svgHeight, svgExtremums} = this.state
    return -y * (svgExtremums[1] - svgExtremums[0]) / svgHeight
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
    return points.map(point => {
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
    const multiLanes = lanes.length > 1
    return (
      <div className={css.container}>
        <div className={css.titleBar}>
          {lanes.map(({id, component, property}, index) => (
            <div
              key={id}
              className={cx(css.title, {
                [css.activeTitle]: multiLanes && id === activeLaneId,
              })}
              {...(multiLanes ? {onClick: e => this.titleClickHandler(e, id)} : {})}
            >
              <div className={css.componentName}>{component}</div>
              <div
                className={css.propertyName}
                style={{color: LanesViewer.colors[index % 4]}}
              >
                {property}
              </div>
            </div>
          ))}
        </div>
        <div className={css.svgArea}>
          <svg
            height={svgHeight}
            width={svgWidth}
            style={{transform: `translateX(${-svgTransform}px)`}}
            ref={svg => {
              if (svg != null) this.svgArea = svg
            }}
            onClick={this.addPoint}
          >
            {lanes.map(({id, points}, index) => (
              <Lane
                key={id}
                laneId={id}
                points={this._normalizePoints(points)}
                color={LanesViewer.colors[index % 4]}
                width={svgWidth}
                changePointPositionBy={(index, change) =>
                  this.changePointPositionBy(id, index, change)
                }
                changePointHandlesBy={(index, change) =>
                  this.changePointHandlesBy(id, index, change)
                }
                setPointPositionTo={(index, newPosition) =>
                  this.setPointPositionTo(id, index, newPosition)
                }
                removePoint={index => this.removePoint(id, index)}
                addConnector={index => this.addConnector(id, index)}
                removeConnector={index => this.removeConnector(id, index)}
                makeHandleHorizontal={(index, side) =>
                  this.makeHandleHorizontal(id, index, side)
                }
                makeHandlesEqual={(index, side) => this.makeHandlesEqual(id, index, side)}
                makeHandlesParallel={(index, side) =>
                  this.makeHandlesParallel(id, index, side)
                }
              />
            ))}
          </svg>
        </div>
      </div>
    )
  }
}

export default connect((s, op) => {
  return {
    lanes: getLanesByIds(s, op.laneIds),
  }
})(LanesViewer)
