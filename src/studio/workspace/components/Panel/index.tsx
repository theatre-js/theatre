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
  panelMove: XY,
  // resize: XY,
  // moveBoundaries: IBoundary,
  // resizeBoundaries: IBoundary,
}

type State = IPanelPlacementState & {
  isMovingPanel: boolean,
  isMovingBoundaries: boolean,
  boundariesMoves: {
    left?: number,
    right?: number,
    top?: number,
    bottom?: number,
  }
}

const SNAP_RANGE = 10

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
      panelMove: Panel.getZeroXY(),
      boundariesMoves: {},
      isMovingPanel: false,
      isMovingBoundaries: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.boundaries !== this.props.boundaries) {
      this.setState(() => ({
        isMovingPanel: false,
        isMovingBoundaries: false,
        panelMove: Panel.getZeroXY(),
        boundariesMoves: {},
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
    const leftRef = gridOfBoundaries.x.find((b: number) => (newLeft - SNAP_RANGE < b) && (b < newLeft + SNAP_RANGE))
    if (leftRef != null) {
      dx = leftRef - left
    } else {
      const newRight = right + dx
      const rightRef = gridOfBoundaries.x.find((b: number) => (newRight - SNAP_RANGE < b) && (b < newRight + SNAP_RANGE))
      if (rightRef != null) {
        dx = rightRef - right
      }
    }
    const topRef = gridOfBoundaries.y.find((b: number) => (newTop - SNAP_RANGE < b) && (b < newTop + SNAP_RANGE))
    if (topRef != null) {
      dy = topRef - top
    } else {
      const newBottom = bottom + dy
      const bottomRef = gridOfBoundaries.y.find((b: number) => (newBottom - SNAP_RANGE < b) && (b < newBottom + SNAP_RANGE))
      if (bottomRef != null) {
        dy = bottomRef - bottom
      }
    }
    this.setState(() => {
      return {
        isMovingPanel: true,
        panelMove: {
          x: dx,
          y: dy,
        }
      }
    })
  }

  setPanelPosition = () => {
    const {boundaries, panelId, gridOfBoundaries} = this.props
    const {panelMove} = this.state
    const newLeft = boundaries.left + panelMove.x
    const newRight = boundaries.right + panelMove.x
    const newTop = boundaries.top + panelMove.y
    const newBottom = boundaries.bottom + panelMove.y
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

    this.props.updatePanelBoundaries(panelId, newBoundaries)
    this.setState(() => ({isMovingPanel: false}))
  }

  moveBoundaries = (deltas: $FixMe) => {
    let left: undefined | number
    let right: undefined | number
    let top: undefined | number
    let bottom: undefined | number

    const {boundaries, gridOfBoundaries} = this.props
    if (deltas.left != null) {
      const newLeft = boundaries.left + deltas.left
      const leftRef = gridOfBoundaries.x.find((b: number) => (newLeft - SNAP_RANGE < b) && (b < newLeft + SNAP_RANGE))
      if (leftRef != null) {
        left = leftRef - boundaries.left
      } else {
        left = deltas.left
      }
    }
    if (deltas.right != null) {
      const newRight = boundaries.right + deltas.right
      const rightRef = gridOfBoundaries.x.find((b: number) => (newRight - SNAP_RANGE < b) && (b < newRight + SNAP_RANGE))
      if (rightRef != null) {
        right = rightRef - boundaries.right
      } else {
        right = deltas.right
      }
    }
    if (deltas.top != null) {
      const newTop = boundaries.top + deltas.top
      const topRef = gridOfBoundaries.y.find((b: number) => (newTop - SNAP_RANGE < b) && (b < newTop + SNAP_RANGE))
      if (topRef != null) {
        top = topRef - boundaries.top
      } else {
        top = deltas.top
      }
    }
    if (deltas.bottom != null) {
      const newBottom = boundaries.bottom + deltas.bottom
      const bottomRef = gridOfBoundaries.y.find((b: number) => (newBottom - SNAP_RANGE < b) && (b < newBottom + SNAP_RANGE))
      if (bottomRef != null) {
        bottom = bottomRef - boundaries.bottom
      } else {
        bottom = deltas.bottom
      }
    }

    this.setState(() => ({
      isMovingBoundaries: true,
      boundariesMoves: _.pickBy({left, right, top, bottom}, (v: undefined | number) => v !== undefined),
    }))
  }

  setBoundariesPositions = () => {
    const {boundaries, panelId, gridOfBoundaries} = this.props
    const {boundariesMoves} = this.state
    const refMapX = _.pickBy(gridOfBoundaries.refMapX, (path: string[]) => path[0] != panelId)
    const refMapY = _.pickBy(gridOfBoundaries.refMapY, (path: string[]) => path[0] != panelId)
    let newBoundaries: $FixMe = {}
    if (boundariesMoves.left != null) {
      const newLeft = boundaries.left + boundariesMoves.left
      newBoundaries = {
        ...newBoundaries,
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
      }
    }
    if (boundariesMoves.right != null) {
      const newRight = boundaries.right + boundariesMoves.right
      newBoundaries = {
        ...newBoundaries,
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
      }
    }
    if (boundariesMoves.top != null) {
      const newTop = boundaries.top + boundariesMoves.top
      newBoundaries = {
        ...newBoundaries,
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
      }
    }
    if (boundariesMoves.bottom != null) {
      const newBottom = boundaries.bottom + boundariesMoves.bottom
      newBoundaries = {
        ...newBoundaries,
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
    }
    this.props.updatePanelBoundaries(panelId, newBoundaries)
    this.setState(() => ({isMovingBoundaries: false}))
  }

  // toggleSettings = () => {
  //   const isInSettings = !this.props.persistentState.isInSettings
  //   this.updatePanelData('persistentState', {isInSettings})
  // }

  updatePanelData(propertyToUpdate: string, newData: Object) {
    this.props.dispatch(
      reduceStateAction(
        ['workspace', 'panels', 'byId', this.props.panelId, propertyToUpdate],
        data => ({...data, ...newData}),
      ),
    )
  }

  // setCurrentlyDraggingOutput = (type: string) => {
  //   const data = {
  //     type,
  //     panel: this.props.panelId,
  //   }

  //   this.props.dispatch(
  //     reduceStateAction(
  //       ['workspace', 'panels', 'currentlyDraggingOutput'],
  //       () => data,
  //     ),
  //   )
  // }

  // clearCurrentlyDraggingOutput = () => {
  //   this.props.dispatch(
  //     reduceStateAction(
  //       ['workspace', 'panels', 'currentlyDraggingOutput'],
  //       () => null,
  //     ),
  //   )
  // }

  render() {
    const {panelComponents} = this
    const {
      persistentState: {isInSettings, ...componentState},
      // pos,
      // dim,
      boundaries,
      configuration,
      currentlyDraggingOutput,
      outputs,
      inputs,
      isInEditMode,
    } = this.props
    const {panelMove, boundariesMoves, isMovingPanel, isMovingBoundaries} = this.state

    let {left, right, top, bottom} = boundaries
    left += boundariesMoves.left ? boundariesMoves.left : 0
    right += boundariesMoves.right ? boundariesMoves.right : 0
    top += boundariesMoves.top ? boundariesMoves.top : 0
    bottom += boundariesMoves.bottom ? boundariesMoves.bottom : 0
    const width = right - left
    const height = bottom - top

    const style = {
      left, top, width, height,
      ...(isMovingPanel
        ? {
            transition: 'transform .05s',
            transform: `translate3d(${panelMove.x}px, ${panelMove.y}px, 0)`,
            zIndex: 1000,
          }
        : {}),
      ...(isMovingBoundaries ? {zIndex: 1000} : {})
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
            onBoundaryDrag={this.moveBoundaries}
            onBoundaryDragEnd={this.setBoundariesPositions}
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
