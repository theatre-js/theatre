import resolveCss from '$shared/utils/resolveCss'
import EditOverlay from '$theater/workspace/components/Panel/EditOverlay'
import {
  IPanelControlChannelData,
  PanelControlChannel,
} from '$theater/workspace/components/PanelController/PanelController'
import {
  EXACT_VALUE,
  SAME_AS_BOUNDARY,
} from '$theater/workspace/components/StudioUI/StudioUI'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'
import {MODES} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import _ from 'lodash'
import React from 'react'
import {Broadcast, Subscriber} from 'react-broadcast'
import * as css from './Panel.css'
import PanelTab from './PanelTab'

interface IProps {
  css?: any
  label?: string
  header?: 'auto' | 'hidden' | React.ReactNode
}

interface IState {
  isMovingPanel: boolean
  isMovingBoundaries: boolean
  panelMove: {x: number; y: number}
  boundariesMoves: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}

const SNAP_RANGE = 10
export const PanelWidthChannel = 'TheaterJS/PanelWidthChannel'
export const PanelActiveModeChannel = 'TheaterJS/PanelActiveModeChannel'

export default class Panel extends PureComponentWithTheater<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {
      panelMove: {x: 0, y: 0},
      boundariesMoves: {},
      isMovingPanel: false,
      isMovingBoundaries: false,
    }
  }

  movePanel = (
    boundaries: $FixMe,
    gridOfBoundaries: $FixMe,
    dx: number,
    dy: number,
  ) => {
    const {left, right, top, bottom} = boundaries
    const newLeft = left + dx
    const newTop = top + dy
    const leftRef = gridOfBoundaries.x.find(
      (b: number) => newLeft - SNAP_RANGE < b && b < newLeft + SNAP_RANGE,
    )
    if (leftRef != null) {
      dx = leftRef - left
    } else {
      const newRight = right + dx
      const rightRef = gridOfBoundaries.x.find(
        (b: number) => newRight - SNAP_RANGE < b && b < newRight + SNAP_RANGE,
      )
      if (rightRef != null) {
        dx = rightRef - right
      }
    }
    const topRef = gridOfBoundaries.y.find(
      (b: number) => newTop - SNAP_RANGE < b && b < newTop + SNAP_RANGE,
    )
    if (topRef != null) {
      dy = topRef - top
    } else {
      const newBottom = bottom + dy
      const bottomRef = gridOfBoundaries.y.find(
        (b: number) => newBottom - SNAP_RANGE < b && b < newBottom + SNAP_RANGE,
      )
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
        },
      }
    })
  }

  setPanelPosition = (
    panelId: string,
    boundaries: $FixMe,
    gridOfBoundaries: $FixMe,
    dispatcherFn: Function,
  ) => {
    const {panelMove} = this.state
    const newLeft = boundaries.left + panelMove.x
    const newRight = boundaries.right + panelMove.x
    const newTop = boundaries.top + panelMove.y
    const newBottom = boundaries.bottom + panelMove.y
    const refMapX = _.pickBy(
      gridOfBoundaries.refMapX,
      (path: string[]) => path[0] != panelId,
    )
    const refMapY = _.pickBy(
      gridOfBoundaries.refMapY,
      (path: string[]) => path[0] != panelId,
    )
    const newBoundaries = {
      left: {
        ...(refMapX.hasOwnProperty(newLeft)
          ? {
              type: SAME_AS_BOUNDARY,
              path: refMapX[newLeft],
            }
          : {
              type: EXACT_VALUE,
              value: newLeft,
            }),
      },
      right: {
        ...(refMapX.hasOwnProperty(newRight)
          ? {
              type: SAME_AS_BOUNDARY,
              path: refMapX[newRight],
            }
          : {
              type: EXACT_VALUE,
              value: newRight,
            }),
      },
      top: {
        ...(refMapY.hasOwnProperty(newTop)
          ? {
              type: SAME_AS_BOUNDARY,
              path: refMapY[newTop],
            }
          : {
              type: EXACT_VALUE,
              value: newTop,
            }),
      },
      bottom: {
        ...(refMapY.hasOwnProperty(newBottom)
          ? {
              type: SAME_AS_BOUNDARY,
              path: refMapY[newBottom],
            }
          : {
              type: EXACT_VALUE,
              value: newBottom,
            }),
      },
    }

    dispatcherFn(panelId, newBoundaries)
    this.setState(() => ({
      isMovingPanel: false,
      panelMove: {x: 0, y: 0},
    }))
  }

  moveBoundaries = (
    boundaries: $FixMe,
    gridOfBoundaries: $FixMe,
    deltas: $FixMe,
  ) => {
    let left: undefined | number
    let right: undefined | number
    let top: undefined | number
    let bottom: undefined | number

    if (deltas.left != null) {
      const newLeft = boundaries.left + deltas.left
      const leftRef = gridOfBoundaries.x.find(
        (b: number) => newLeft - SNAP_RANGE < b && b < newLeft + SNAP_RANGE,
      )
      if (leftRef != null) {
        left = leftRef - boundaries.left
      } else {
        left = deltas.left
      }
    }
    if (deltas.right != null) {
      const newRight = boundaries.right + deltas.right
      const rightRef = gridOfBoundaries.x.find(
        (b: number) => newRight - SNAP_RANGE < b && b < newRight + SNAP_RANGE,
      )
      if (rightRef != null) {
        right = rightRef - boundaries.right
      } else {
        right = deltas.right
      }
    }
    if (deltas.top != null) {
      const newTop = boundaries.top + deltas.top
      const topRef = gridOfBoundaries.y.find(
        (b: number) => newTop - SNAP_RANGE < b && b < newTop + SNAP_RANGE,
      )
      if (topRef != null) {
        top = topRef - boundaries.top
      } else {
        top = deltas.top
      }
    }
    if (deltas.bottom != null) {
      const newBottom = boundaries.bottom + deltas.bottom
      const bottomRef = gridOfBoundaries.y.find(
        (b: number) => newBottom - SNAP_RANGE < b && b < newBottom + SNAP_RANGE,
      )
      if (bottomRef != null) {
        bottom = bottomRef - boundaries.bottom
      } else {
        bottom = deltas.bottom
      }
    }

    this.setState(() => ({
      isMovingBoundaries: true,
      boundariesMoves: _.pickBy(
        {left, right, top, bottom},
        (v: undefined | number) => v !== undefined,
      ),
    }))
  }

  setBoundariesPositions = (
    panelId: string,
    boundaries: $FixMe,
    gridOfBoundaries: $FixMe,
    dispatcherFn: Function,
  ) => {
    const {boundariesMoves} = this.state
    const refMapX = _.pickBy(
      gridOfBoundaries.refMapX,
      (path: string[]) => path[0] != panelId,
    )
    const refMapY = _.pickBy(
      gridOfBoundaries.refMapY,
      (path: string[]) => path[0] != panelId,
    )
    let newBoundaries: $FixMe = {}
    if (boundariesMoves.left != null) {
      const newLeft = boundaries.left + boundariesMoves.left
      newBoundaries = {
        ...newBoundaries,
        left: {
          ...(refMapX.hasOwnProperty(newLeft)
            ? {
                type: SAME_AS_BOUNDARY,
                path: refMapX[newLeft],
              }
            : {
                type: EXACT_VALUE,
                value: newLeft,
              }),
        },
      }
    }
    if (boundariesMoves.right != null) {
      const newRight = boundaries.right + boundariesMoves.right
      newBoundaries = {
        ...newBoundaries,
        right: {
          ...(refMapX.hasOwnProperty(newRight)
            ? {
                type: SAME_AS_BOUNDARY,
                path: refMapX[newRight],
              }
            : {
                type: EXACT_VALUE,
                value: newRight,
              }),
        },
      }
    }
    if (boundariesMoves.top != null) {
      const newTop = boundaries.top + boundariesMoves.top
      newBoundaries = {
        ...newBoundaries,
        top: {
          ...(refMapY.hasOwnProperty(newTop)
            ? {
                type: SAME_AS_BOUNDARY,
                path: refMapY[newTop],
              }
            : {
                type: EXACT_VALUE,
                value: newTop,
              }),
        },
      }
    }
    if (boundariesMoves.bottom != null) {
      const newBottom = boundaries.bottom + boundariesMoves.bottom
      newBoundaries = {
        ...newBoundaries,
        bottom: {
          ...(refMapY.hasOwnProperty(newBottom)
            ? {
                type: SAME_AS_BOUNDARY,
                path: refMapY[newBottom],
              }
            : {
                type: EXACT_VALUE,
                value: newBottom,
              }),
        },
      }
    }
    dispatcherFn(panelId, newBoundaries)
    this.setState(() => ({
      isMovingBoundaries: false,
      boundariesMoves: {},
    }))
  }

  render() {
    const {props, state} = this
    const classes = resolveCss(css, props.css)
    const {children, label, header} = props
    const {
      panelMove,
      boundariesMoves,
      isMovingPanel,
      isMovingBoundaries,
    } = state

    return (
      <Subscriber channel={PanelControlChannel}>
        {(config: IPanelControlChannelData) => {
          const {
            panelId,
            isActive,
            label: defaultLabel,
            activeMode,
            boundaries,
            gridOfBoundaries,
            updatePanelBoundaries,
          } = config

          let {left, right, top, bottom} = boundaries
          left += boundariesMoves.left ? boundariesMoves.left : 0
          right += boundariesMoves.right ? boundariesMoves.right : 0
          top += boundariesMoves.top ? boundariesMoves.top : 0
          bottom += boundariesMoves.bottom ? boundariesMoves.bottom : 0
          const width = right - left
          const height = bottom - top

          const style = {
            left,
            top,
            width,
            height,
            ...(isMovingPanel
              ? {
                  transition: 'transform .05s',
                  transform: `translate3d(${panelMove.x}px, ${
                    panelMove.y
                  }px, 0)`,
                  zIndex: 1000,
                }
              : {}),
            ...(isMovingBoundaries ? {zIndex: 1000} : {}),
            ...(header === 'hidden' ? {'--headerHeight': '0px'} : {}),
          }

          return (
            <div
              {...classes('container', isActive && 'isActive')}
              style={style}
            >
              {header !== 'hidden' && (
                <div className={css.header}>
                  {header === 'auto' || header === undefined ? (
                    <div className={css.defaultHeaderContent}>
                      <PanelTab isCurrent={true}>
                        {label || defaultLabel}
                      </PanelTab>
                    </div>
                  ) : (
                    header
                  )}
                </div>
              )}
              <Broadcast
                channel={PanelWidthChannel}
                value={{width}}
                compareValues={(prevValue: $FixMe, nextValue: $FixMe) =>
                  _.isEqual(prevValue, nextValue)
                }
              >
                <Broadcast
                  channel={PanelActiveModeChannel}
                  compareValues={(prevValue: $FixMe, nextValue: $FixMe) =>
                    _.isEqual(prevValue, nextValue)
                  }
                  value={{activeMode}}
                >
                  <div className={css.content}>{children}</div>
                </Broadcast>
              </Broadcast>
              {activeMode === MODES.option && (
                <EditOverlay
                  onMove={(dx: number, dy: number) =>
                    this.movePanel(boundaries, gridOfBoundaries, dx, dy)
                  }
                  onMoveEnd={() =>
                    this.setPanelPosition(
                      panelId,
                      boundaries,
                      gridOfBoundaries,
                      updatePanelBoundaries,
                    )
                  }
                  onResize={(deltas: $FixMe) =>
                    this.moveBoundaries(boundaries, gridOfBoundaries, deltas)
                  }
                  onResizeEnd={() =>
                    this.setBoundariesPositions(
                      panelId,
                      boundaries,
                      gridOfBoundaries,
                      updatePanelBoundaries,
                    )
                  }
                />
              )}
            </div>
          )
        }}
      </Subscriber>
    )
  }
}
