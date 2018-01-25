// @flow
import {React, reduceStateAction, connect, compose} from '$studio/handy'
import css from './index.css'
import Settings from './Settings'
import cx from 'classnames'
import {
  XY,
  PanelPlacementSettings,
  PanelType,
  PanelConfiguration,
  PanelPersistentState,
  PanelOutput,
  DraggingOutput,
} from '$studio/workspace/types'

import {
  getPanelById,
  getCurrentlyDraggingOutput,
  getPanelInputs,
  getActivePanelId,
} from '$studio/workspace/selectors'

import panelTypes from '$studio/workspace/panelTypes'
import _ from 'lodash'

type OwnProps = {
  panelId: string,
}

type Props = OwnProps &
  PanelPlacementSettings & {
    dispatch: Function,
    type: PanelType,
    configuration: PanelConfiguration,
    persistentState: PanelPersistentState,
    currentlyDraggingOutput: DraggingOutput,
    outputs: PanelOutput,
    inputs: {[string]: Object},
    isActive: boolean,
  }

type Boundary = {xlow: number, xhigh: number, ylow: number, yhigh: number}

type PanelPlacementState = {
  move: XY,
  resize: XY,
  moveBoundaries: Boundary,
  resizeBoundaries: Boundary,
}

type State = PanelPlacementState & {
  isMoving: boolean,
}

class Panel extends React.Component<Props, State> {
  panelComponents: {
    Content: React$ComponentType<*>,
    Settings: React$ComponentType<*>,
  }

  static defaultProps = {
    persistentState: {
      isInSettings: true,
    },
    outputs: {},
  }

  static getZeroXY() {
    return {x: 0, y: 0}
  }

  constructor(props: Props) {
    super(props)
    this.panelComponents = panelTypes[props.type].components
    this.state = {
      ...this.getPanelPlacementSettings(props.pos, props.dim),
      isMoving: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const {pos, dim} = nextProps
    if (pos !== this.props.pos || dim !== this.props.dim) {
      this.setState(state => ({
        isMoving: state.isMoving,
        ...this.getPanelPlacementSettings(pos, dim),
      }))
    }
  }

  getPanelPlacementSettings(pos: XY, dim: XY) {
    return {
      move: Panel.getZeroXY(),
      resize: Panel.getZeroXY(),
      ...this.calculatePanelBoundaries(pos, dim),
    }
  }

  calculatePanelBoundaries(
    pos: XY,
    dim: XY,
  ): {moveBoundaries: Boundary, resizeBoundaries: Boundary} {
    const distanceToRight = 100 - pos.x - dim.x
    const distanceToBottom = 100 - pos.y - dim.y
    return {
      moveBoundaries: {
        xlow: -pos.x * window.innerWidth / 100,
        xhigh: distanceToRight * window.innerWidth / 100,
        ylow: -pos.y * window.innerHeight / 100,
        yhigh: distanceToBottom * window.innerHeight / 100,
      },
      resizeBoundaries: {
        xlow: -(dim.x - 10),
        xhigh: distanceToRight,
        ylow: -(dim.y - 10),
        yhigh: distanceToBottom,
      },
    }
  }

  movePanel = (dx: number, dy: number) => {
    this.setState(state => {
      const {moveBoundaries: {xlow, xhigh, ylow, yhigh}} = state
      return {
        isMoving: true,
        move: {
          x: _.clamp(dx, xlow, xhigh),
          y: _.clamp(dy, ylow, yhigh),
        },
      }
    })
  }

  setPanelPosition = () => {
    const {pos, panelId} = this.props
    const {move} = this.state
    const newPos = {
      x: pos.x + move.x / window.innerWidth * 100,
      y: pos.y + move.y / window.innerHeight * 100,
    }

    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'byId', panelId, 'placementSettings', 'pos'],
        () => newPos,
      ),
    )
    this.setState(() => ({isMoving: false}))
  }

  resizePanel = (dx: number, dy: number) => {
    this.setState(state => {
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
    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'byId', panelId, 'placementSettings', 'dim'],
        () => newDim,
      ),
    )
  }

  toggleSettings = () => {
    const isInSettings = !this.props.persistentState.isInSettings
    this.updatePanelData('persistentState', {isInSettings})
  }

  updatePanelData(propertyToUpdate: string, newData: Object) {
    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'byId', this.props.panelId, propertyToUpdate],
        data => ({...data, ...newData}),
      ),
    )
  }

  setCurrentlyDraggingOutput = (type: string) => {
    const data = {
      type,
      panel: this.props.panelId,
    }

    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'currentlyDraggingOutput'],
        () => data,
      ),
    )
  }

  clearCurrentlyDraggingOutput = () => {
    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'currentlyDraggingOutput'],
        () => null,
      ),
    )
  }

  render() {
    const {panelComponents} = this
    const {
      persistentState: {isInSettings, ...componentState},
      pos,
      dim,
      configuration,
      currentlyDraggingOutput,
      outputs,
      inputs,
    } = this.props
    const {move, resize, isMoving} = this.state
    const style = {
      left: `${pos.x}%`,
      top: `${pos.y}%`,
      width: `${dim.x + resize.x}%`,
      height: `${dim.y + resize.y}%`,
      ...(isMoving
        ? {
            transform: `translate3d(${move.x}px, ${move.y}px, 0)`,
            zIndex: 1,
          }
        : {}),
    }

    return (
      <div
        className={cx(css.container, {[css.isActive]: this.props.isActive})}
        style={style}
      >
        <div className={css.innerWrapper}>
          <div className={css.topBar}>
            <div className={css.title}>{panelTypes[this.props.type].label}</div>
            {/*<div
            className={css.settings}
            onClick={this.toggleSettings}>
            {isInSettings ? 'Show Content' : 'Show Settings'}
          </div>*/}
          </div>

          <div className={css.content}>
            {isInSettings ? (
              <Settings
                onPanelDrag={this.movePanel}
                onPanelDragEnd={this.setPanelPosition}
                onPanelResize={this.resizePanel}
                onPanelResizeEnd={this.setPanelSize}
              >
                <panelComponents.Settings
                  {...configuration}
                  inputs={inputs}
                  currentlyDraggingOutput={currentlyDraggingOutput}
                  setCurrentlyDraggingOutput={this.setCurrentlyDraggingOutput}
                  clearCurrentlyDraggingOutput={
                    this.clearCurrentlyDraggingOutput
                  }
                  updatePanelInput={newData =>
                    this.updatePanelData('inputs', newData)
                  }
                  updatePanelConfig={newData =>
                    this.updatePanelData('configuration', newData)
                  }
                />
              </Settings>
            ) : (
              <panelComponents.Content
                {...configuration}
                {...componentState}
                panelDimensions={dim}
                outputs={outputs}
                inputs={inputs}
                updatePanelOutput={newData =>
                  this.updatePanelData('outputs', newData)
                }
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default compose(
  connect((s, op: OwnProps) => {
    const {
      type,
      configuration,
      placementSettings,
      persistentState,
      outputs,
      inputs,
    } = getPanelById(s, op.panelId)
    const currentlyDraggingOutput = getCurrentlyDraggingOutput(s)

    return {
      type,
      configuration,
      persistentState,
      ...placementSettings,
      currentlyDraggingOutput,
      outputs,
      inputs: getPanelInputs(s, inputs),
      isActive: getActivePanelId(s) === op.panelId,
    }
  }),
)(Panel)
