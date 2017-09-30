// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {getLanesByIds} from '$studio/animationTimeline/selectors'
import {addPointToLane, updatePointProps} from '$studio/animationTimeline/sagas'
import css from './LanesViewer.css'
import Lane from './Lane'

type Props = WithRunSagaProps & {
  boxHeight: number,
  lanes: $FlowFixMe,
  laneIds: $FlowFixMe,
  splitLane: Function,
  panelWidth: number,
  duration: number,
  currentTime: number,
  focus: [number, number],
}

type State = {
  svgWidth: number,
  svgHeight: number,
  svgTransform: number,
  svgExtremums: [number, number],
}

type PointProps = {
  t: number,
  value: number,
  handles: [number, number, number, number],
}

class LanesViewer extends React.PureComponent<Props, State> {
  svgArea: $FlowFixMe

  // ??
  static colors = ['darkturquoise', 'orchid', 'mediumspringgreen', 'gold']

  constructor(props: Props) {
    super(props)

    this.state = {
      ...this._getSvgState(props),
    }
  }

  componentWillReceiveProps(newProps) {
    this.setState(() => ({...this._getSvgState(newProps)}))    
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

  addPoint = (e: SyntheticMouseEvent) => {
    const {top, left} = this.svgArea.getBoundingClientRect()
    const t = e.clientX - left
    const value = e.clientY - top
    this.props.runSaga(addPointToLane, this.props.laneIds[0], this._deNormalizeX(t), this._deNormalizeValue(value))
  }

  updatePointProps = (laneId: number, pointIndex: number, newProps: PointProps) => {
    this.props.runSaga(updatePointProps, laneId, pointIndex, this.deNormalizePointProps(newProps))
  }

  normalizePointProps = (pointProps: PointProps) => {
    const {t, value, handles} = pointProps
    return {
      ...pointProps,
      t: this._normalizeX(t),
      value: this._normalizeValue(value),
      handles: [
        this._normalizeX(handles[0]),
        this._normalizeY(handles[1]),
        this._normalizeX(handles[2]),
        this._normalizeY(handles[3]),
      ],
    }
  }

  deNormalizePointProps = (pointProps: PointProps) => {
    const {t, value, handles} = pointProps
    return {
      ...pointProps,
      t: this._deNormalizeX(t),
      value: this._deNormalizeValue(value),
      handles: [
        this._deNormalizeX(handles[0]),
        this._deNormalizeY(handles[1]),
        this._deNormalizeX(handles[2]),
        this._deNormalizeY(handles[3]),
      ],
    }
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

  render() {
    const {lanes, splitLane} = this.props
    const {svgHeight, svgWidth, svgTransform} = this.state
    const shouldSplit = (lanes.length > 1)
    return (
      <div className={css.container}>
        <div className={css.titleBar}>
          {lanes.map(({id, component, property}, index) => (
            <div
              key={id}
              className={css.title}
              {...(shouldSplit ? {onClick: () => splitLane(id)} : {})}>
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
            ref={(svg) => {this.svgArea = svg}}
            onDoubleClick={this.addPoint}>
            {
              lanes.map(({id, points}, index) => (
                <Lane
                  key={id}
                  laneId={id}
                  points={points}
                  color={LanesViewer.colors[index%4]}
                  normalizePointProps={this.normalizePointProps}
                  updatePointProps={(index, newProps) => this.updatePointProps(id, index, newProps)}/>
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
    (state: $FlowFixMe, ownProps: $FlowFixMe) => {
      return {
        lanes: getLanesByIds(state, ownProps.laneIds),
      }
    }
  ),
  withRunSaga(),
)(LanesViewer)