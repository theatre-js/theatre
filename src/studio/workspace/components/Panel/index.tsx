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
import EditOverlay from '$src/studio/workspace/components/Panel/EditOverlay'
import {EXACT_VALUE, SAME_AS_BOUNDARY} from '$src/studio/workspace/components/TheUI'

type OwnProps = {
  panelId: string
  isInEditMode: boolean
  boundaries: $FixMe
  gridOfBoundaries: $FixMe
  updatePanelBoundaries: Function
}

type Props = OwnProps &
  PanelPlacementSettings & {
    dispatch: Function,
    type: PanelType,
    configuration: PanelConfiguration,
    persistentState: PanelPersistentState,
    currentlyDraggingOutput: DraggingOutput,
    outputs: PanelOutput,
    inputs: {[k: string]: Object},
    isActive: boolean,
  }

interface IBoundary {xlow: number, xhigh: number, ylow: number, yhigh: number}

interface IPanelPlacementState {
  move: XY,
  resize: XY,
  moveBoundaries: IBoundary,
  resizeBoundaries: IBoundary,
}

type State = IPanelPlacementState & {
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
      // ...this.getPanelPlacementSettings(props.boundaries),
      move: Panel.getZeroXY(),
      isMoving: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const {pos, dim} = nextProps
    if (pos !== this.props.pos || dim !== this.props.dim) {
      this.setState(state => ({
        isMoving: state.isMoving,
        move: Panel.getZeroXY(),      
        // ...this.getPanelPlacementSettings(pos, dim),
      }))
    }
  }

  // getPanelPlacementSettings(placementSettings) {
  //   return {
  //     move: Panel.getZeroXY(),
  //     resize: Panel.getZeroXY(),
  //     ...this.calculatePanelBoundaries(pos, dim),
  //   }
  // }

  // calculatePanelBoundaries(
  //   pos: XY,
  //   dim: XY,
  // ): {moveBoundaries: IBoundary, resizeBoundaries: IBoundary} {
  //   const distanceToRight = 100 - pos.x - dim.x
  //   const distanceToBottom = 100 - pos.y - dim.y
  //   return {
  //     moveBoundaries: {
  //       xlow: -pos.x * window.innerWidth / 100,
  //       xhigh: distanceToRight * window.innerWidth / 100,
  //       ylow: -pos.y * window.innerHeight / 100,
  //       yhigh: distanceToBottom * window.innerHeight / 100,
  //     },
  //     resizeBoundaries: {
  //       xlow: -(dim.x - 10),
  //       xhigh: distanceToRight,
  //       ylow: -(dim.y - 10),
  //       yhigh: distanceToBottom,
  //     },
  //   }
  // }

  movePanel = (dx: number, dy: number) => {
    const {boundaries: {left, top, right, bottom}, gridOfBoundaries} = this.props
    const newLeft = left + dx
    const newTop = top + dy
    const leftRef = gridOfBoundaries.x.find((b: number) => (newLeft - 10 < b) && (b < newLeft + 10))
    if (leftRef != null) {
      dx = leftRef - left
    } else {
      const newRight = right + dx
      const rightRef = gridOfBoundaries.x.find((b: number) => (newRight - 10 < b) && (b < newRight + 10))
      if (rightRef != null) {
        dx = rightRef - right
      }
    }
    const topRef = gridOfBoundaries.y.find((b: number) => (newTop - 10 < b) && (b < newTop + 10))
    if (topRef != null) {
      dy = topRef - top
    } else {
      const newBottom = bottom + dy
      const bottomRef = gridOfBoundaries.y.find((b: number) => (newBottom - 10 < b) && (b < newBottom + 10))
      if (bottomRef != null) {
        dy = bottomRef - bottom
      }
    }
    this.setState(() => {
      return {
        isMoving: true,
        move: {
          x: dx,
          y: dy,
        }
      }
    })
  }

  setPanelPosition = () => {
    const {boundaries, panelId, gridOfBoundaries} = this.props
    const {move} = this.state
    const newLeft = boundaries.left + move.x
    const newRight = boundaries.right + move.x
    const newTop = boundaries.top + move.y
    const newBottom = boundaries.bottom + move.y
    const refMapX = _.pickBy(gridOfBoundaries.refMapX, (path: string[]) => path[0] != panelId)
    const refMapY = _.pickBy(gridOfBoundaries.refMapY, (path: string[]) => path[0] != panelId)
    const newBoundaries = {
      left: {
        ...(refMapX.hasOwnProperty(newLeft)
          ?
            {
              type: SAME_AS_BOUNDARY,
              path: refMapX[newLeft],
            }
          :
            {
              type: EXACT_VALUE,
              value: newLeft,
            }
        )
      },
      right: {
        ...(refMapX.hasOwnProperty(newRight)
        ?
          {
            type: SAME_AS_BOUNDARY,
            path: refMapX[newRight],
          }
        :
          {
            type: EXACT_VALUE,
            value: newRight,
          }
        )
      },
      top: {
        ...(refMapY.hasOwnProperty(newTop)
          ?
            {
              type: SAME_AS_BOUNDARY,
              path: refMapY[newTop],
            }
          :
            {
              type: EXACT_VALUE,
              value: newTop,
            }
        )
      },
      bottom: {
        ...(refMapY.hasOwnProperty(newBottom)
          ?
            {
              type: SAME_AS_BOUNDARY,
              path: refMapY[newBottom],
            }
          :
            {
              type: EXACT_VALUE,
              value: newBottom,
            }
        )
      },
    }

    // this.props.dispatch(
    //   reduceStateAction(
    //     ['workspace', 'panels', 'byId', panelId, 'boundaries'],
    //     () => newBoundaries,
    //   ),
    // )
    this.props.updatePanelBoundaries(panelId, newBoundaries)
    this.setState(() => ({isMoving: false}))
    // const {pos, panelId} = this.props
    // const {move} = this.state
    // const newPos = {
    //   x: pos.x + move.x / window.innerWidth * 100,
    //   y: pos.y + move.y / window.innerHeight * 100,
    // }

    // this.props.dispatch(
    //   reduceStateAction(
    //     ['workspace', 'panels', 'byId', panelId, 'placementSettings', 'pos'],
    //     () => newPos,
    //   ),
    // )
    // this.setState(() => ({isMoving: false}))
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
      // pos,
      // dim,
      boundaries: {left, top, right, bottom},
      configuration,
      currentlyDraggingOutput,
      outputs,
      inputs,
      isInEditMode,
    } = this.props
    const {move, resize, isMoving} = this.state
    const width = right - left
    const height = bottom - top
    const style = {
      // left: `${left}%`,
      // top: `${pos.y}%`,
      // width: `${dim.x + resize.x}%`,
      // height: `${dim.y + resize.y}%`,
      left, top, width, height,
      ...(isMoving
        ? {
            transition: 'transform .05s',
            transform: `translate3d(${move.x}px, ${move.y}px, 0)`,
            zIndex: 100,
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
                panelDimensions={{x: width, y: height}}
                outputs={outputs}
                inputs={inputs}
                updatePanelOutput={newData =>
                  this.updatePanelData('outputs', newData)
                }
              />
            )}
          </div>
        </div>
        {isInEditMode &&
          <EditOverlay
            onPanelDrag={this.movePanel}
            onPanelDragEnd={this.setPanelPosition}
            // onPanelResize={this.resizePanel}
            // onPanelResizeEnd={this.setPanelSize}
          />
        }
      </div>
    )
  }
}

export default compose(
  connect((s, op: OwnProps) => {
    const {
      type,
      configuration,
      persistentState,
      outputs,
      inputs,
    } = getPanelById(s, op.panelId)
    const currentlyDraggingOutput = getCurrentlyDraggingOutput(s)

    return {
      type,
      configuration,
      persistentState,
      currentlyDraggingOutput,
      outputs,
      inputs: getPanelInputs(s, inputs),
      isActive: getActivePanelId(s) === op.panelId,
    }
  }),
)(Panel)
