// @flow
import React from 'react'
import css from './index.css'
import Settings from './Settings'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {withRunSaga, type WithRunSagaProps} from '$shared/utils'
import {type StoreState} from '$studio/types'
import {type XY} from '$studio/workspace/types'
import {getPanelById} from '$studio/workspace/selectors'
import {setPanelPosition, setPanelSize} from '$studio/workspace/sagas'
import _ from 'lodash'

type OwnProps = {
  children: any,
  panelId: string,
}

type Props = WithRunSagaProps & OwnProps & {
  pos: XY,
  dim: XY,
}

type Boundary = {xlow: number, xhigh: number, ylow: number, yhigh: number}

type PanelPlacementSettings = {
  move: XY,
  resize: XY,
  moveBoundaries: Boundary,
  resizeBoundaries: Boundary,
}

type State = PanelPlacementSettings & {
  isInSettings: boolean,
}

class Panel extends React.Component<Props, State> {
  static getZeroXY() {
    return {x: 0, y: 0}
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      isInSettings: false,
      ...this.getPanelPlacementSettings(props.pos, props.dim),
    }
  }

  componentWillReceiveProps(nextProps) {
    const {pos, dim} = nextProps
    if (pos !== this.props.pos || dim !== this.props.dim) {
      this.setState(() => (this.getPanelPlacementSettings(pos, dim)))
    }
  }

  getPanelPlacementSettings(pos: XY, dim: XY) {
    return {
      move: Panel.getZeroXY(),
      resize: Panel.getZeroXY(),
      ...this.calculatePanelBoundaries(pos, dim),
    }
  }

  calculatePanelBoundaries(pos: XY, dim: XY): {moveBoundaries: Boundary, resizeBoundaries: Boundary}
  {
    const distanceToRight = 100 - pos.x - dim.x
    const distanceToBottom = 100 - pos.y - dim.y
    return {
      moveBoundaries: {
        xlow: - pos.x * window.innerWidth / 100,
        xhigh: distanceToRight * window.innerWidth / 100,
        ylow: - pos.y * window.innerHeight / 100,
        yhigh: distanceToBottom * window.innerHeight / 100,
      },
      resizeBoundaries: {
        xlow: - (dim.x - 10),
        xhigh: distanceToRight,
        ylow: - (dim.y - 10),
        yhigh: distanceToBottom,
      },
    }
  }

  toggleSettings = () => {
    this.setState((state) => ({isInSettings: !state.isInSettings}))
  }

  movePanel = (dx: number, dy: number) => {
    this.setState((state) => {
      const {moveBoundaries: {xlow, xhigh, ylow, yhigh}} = state
      return {
        move: {
          x: _.clamp(dx, xlow, xhigh),
          y: _.clamp(dy, ylow, yhigh),
        }}
    })
  }

  setPanelPosition = () => {
    const {pos, panelId} = this.props
    const {move} = this.state
    const newPos = {
      x: pos.x + move.x / window.innerWidth * 100,
      y: pos.y + move.y / window.innerHeight * 100,
    }
    this.props.runSaga(setPanelPosition, panelId, newPos)
  }

  resizePanel = (dx: number, dy: number) => {
    this.setState((state) => {
      const {resizeBoundaries: {xlow, xhigh, ylow, yhigh}} = state
      return {
        resize: {
          x: _.clamp(dx / window.innerWidth * 100, xlow, xhigh),
          y: _.clamp(dy / window.innerHeight * 100, ylow, yhigh),
        },
      }
    })
  }

  setPanelSize = () => {
    const {dim, panelId} = this.props
    const {resize} = this.state
    const newDim = {
      x: dim.x + resize.x,
      y: dim.y + resize.y,
    }
    this.props.runSaga(setPanelSize, panelId, newDim)
  }

  render() {
    const {children, pos, dim} = this.props
    const {isInSettings, move, resize} = this.state
    const style = {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      width: `${dim.x + resize.x}%`,
      height: `${dim.y + resize.y}%`,
      transform: `translate3d(${move.x}px, ${move.y}px, 0)`,
    }

    return (
      <div className={css.container} style={style}>
        <div className={css.topBar}>
          <div
            className={css.settings}
            onClick={this.toggleSettings}>
            {isInSettings ? 'Confirm Settings' : 'Show Settings'}
          </div>
        </div>
        <div className={css.content}>
          {isInSettings
            ?
            <Settings
              onPanelDrag={this.movePanel}
              onPanelDragEnd={this.setPanelPosition}
              onPanelResize={this.resizePanel}
              onPanelResizeEnd={this.setPanelSize}/>
            :
            children}
        </div>
      </div>
    )
  }
}

export default compose(
  connect(
    (state: StoreState, ownProps: OwnProps) => ({...getPanelById(state, ownProps.panelId)})
  ),
  withRunSaga(),
)(Panel)
