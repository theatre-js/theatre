import React from 'react'
import {Subscriber, Broadcast} from 'react-broadcast'
import {PanelActiveModeChannel} from '$theater/workspace/components/Panel/Panel'
import {
  MODES,
  ActiveMode,
} from '$theater/common/components/ActiveModeDetector/ActiveModeDetector'
import css from './SelectionProvider.css'
import resolveCss from '$shared/utils/resolveCss'
import {disableEvent, getSvgWidth} from '$theater/AnimationTimelinePanel/utils'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {
  BoxesObject,
  LayoutArray,
  Variables,
} from '$theater/AnimationTimelinePanel/types'
import {val} from '$shared/DataVerse2/atom'
import {get, setImmutable as set} from '$shared/utils'
import {Pointer} from '$shared/DataVerse2/pointer'
import * as utils from '$theater/AnimationTimelinePanel/selection/utils'
import {
  TDims,
  TTransformedSelectedArea,
  TBoxesBoundaries,
  TSelectedPoints,
  TSelectionAPI,
  TExtremumsMap,
  TSelectionMove,
  THorizontalLimits,
} from '$theater/AnimationTimelinePanel/selection/types'
import {reduceHistoricState} from '$theater/bootstrap/actions'
import PureComponentWithTheater from '$theater/handy/PureComponentWithTheater'

const classes = resolveCss(css)

interface IProps {
  pathToTimeline: string[]
  focus: [number, number]
  duration: number
  boxWidth: number
}

interface IState {
  status: 'noSelection' | 'selectingPoints' | 'movingPoints'
  startPoint: {
    left: number
    top: number
  }
  move: TSelectionMove
  dims: TDims
  horizontalLimits: THorizontalLimits
  transformedSelectedArea: TTransformedSelectedArea
  boxesBoundaries: TBoxesBoundaries
}

type TBoxesAndLayout = {
  boxes: BoxesObject
  layout: LayoutArray
}

export const SelectionAPIChannel = 'TheaterJS/SelectionAPIChannel'
export const SelectionMoveChannel = 'TheaterJS/SelectionMoveChannel'
export const SelectedAreaChannel = 'TheaterJS/SelectedAreaChannel'

class SelectionProvider extends PureComponentWithTheater<IProps, IState> {
  selectionZone: HTMLDivElement | null
  selectedPoints: TSelectedPoints = {}
  extremumsOfVariablesInSelection: TExtremumsMap = {}

  static defaultStateValues: IState = {
    status: 'noSelection',
    move: {x: 0, y: 0},
    startPoint: {left: 0, top: 0},
    dims: {left: 0, top: 0, width: 0, height: 0},
    transformedSelectedArea: {},
    boxesBoundaries: [],
    horizontalLimits: {left: -Infinity, right: Infinity},
  }

  state = SelectionProvider.defaultStateValues

  render() {
    return (
      <Subscriber channel={PanelActiveModeChannel}>
        {(activeMode: ActiveMode) => {
          const renderSelectionArea =
            activeMode === MODES.shift || this.state.status !== 'noSelection'
          return renderSelectionArea
            ? this._renderSelectionArea()
            : this._renderBroadcasts()
        }}
      </Subscriber>
    )
  }

  _renderSelectionArea() {
    const {move, status} = this.state
    const {duration, focus, boxWidth} = this.props
    const statusIsMovingPoints = status === 'movingPoints'
    const svgWidth = getSvgWidth(duration, focus, boxWidth)
    return (
      <>
        {this._renderBroadcasts()}
        <div {...classes('selectionContainer')} style={{width: svgWidth}}>
          <DraggableArea
            shouldRegisterEvents={!statusIsMovingPoints}
            onDragStart={this.activateSelection}
            onDrag={this.setSelectionDimsAndBoundaries}
            onDragEnd={this.confirmSelectionDims}
          >
            <div
              ref={c => (this.selectionZone = c)}
              {...classes('selectionZone', statusIsMovingPoints && 'confirm')}
              {...this._getZoneProps(status)}
              style={{width: boxWidth}}
            >
              <DraggableArea
                shouldRegisterEvents={statusIsMovingPoints}
                shouldReturnMovement={true}
                onDrag={this.areaMoveHandler}
              >
                <div
                  style={{transform: `translate3d(${move.x}px,${move.y}px,0)`}}
                >
                  <div
                    {...classes(
                      'selectedArea',
                      statusIsMovingPoints && 'movable',
                    )}
                    style={this.state.dims}
                  />
                </div>
              </DraggableArea>
            </div>
          </DraggableArea>
        </div>
      </>
    )
  }

  _renderBroadcasts() {
    return (
      <Broadcast channel={SelectionAPIChannel} value={this.api}>
        <Broadcast
          channel={SelectedAreaChannel}
          value={this.state.transformedSelectedArea}
        >
          <Broadcast channel={SelectionMoveChannel} value={this.state.move}>
            {this.props.children}
          </Broadcast>
        </Broadcast>
      </Broadcast>
    )
  }

  applyChangesToSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    disableEvent(e)
    const {duration, focus, boxWidth} = this.props
    const {move, boxesBoundaries} = this.state
    const svgWidth = getSvgWidth(duration, focus, boxWidth)
    const {boxes, layout} = this._getBoxesAndLayout()
    this.dispatch(
      reduceHistoricState(
        this.props.pathToTimeline.concat('variables'),
        (variables: Variables) => {
          Object.keys(this.selectedPoints).forEach((boxKey: string) => {
            const boxInfo = this.selectedPoints[boxKey]
            const dopeSheet = boxes[layout[Number(boxKey)]].dopeSheet
            const boxHeight =
              boxesBoundaries[2 * Number(boxKey) + 1] -
              boxesBoundaries[2 * Number(boxKey)]
            Object.keys(boxInfo).forEach((variableKey: string) => {
              const variableInfo = boxInfo[variableKey]
              const extremums = this.extremumsOfVariablesInSelection[
                variableKey
              ]
              const extDiff = extremums[1] - extremums[0]
              Object.keys(variableInfo).forEach((pointKey: string) => {
                const path = [variableKey, 'points', pointKey]
                const pointProps = get(variables, path)
                variables = set(
                  path,
                  {
                    ...pointProps,
                    time: pointProps.time + (move.x / svgWidth) * duration,
                    value:
                      pointProps.value -
                      (dopeSheet ? 0 : (move.y / boxHeight) * extDiff),
                  },
                  variables,
                )
              })
            })
          })
          return variables
        },
      ),
    )
    this._clearSelection()
  }

  _getBoxesAndLayout(): TBoxesAndLayout {
    const boxes: BoxesObject = this.theater.atom2.getIn(
      this.props.pathToTimeline.concat('boxes'),
    )
    const layout: LayoutArray = this.theater.atom2.getIn(
      this.props.pathToTimeline.concat('layout'),
    )
    return {boxes, layout}
  }

  _getTransformedSelectedArea(dims: TDims): TTransformedSelectedArea {
    const {focus, duration, boxWidth} = this.props
    const {boxesBoundaries} = this.state
    const offsetTop = this.selectionZone!.offsetTop
    return utils.getTransformedSelectedArea(
      dims,
      focus,
      duration,
      boxWidth,
      boxesBoundaries,
      offsetTop,
    )
  }

  activateSelection = (e: React.MouseEvent<HTMLDivElement>) => {
    const {layerX, layerY} = e.nativeEvent
    const {boxes, layout} = this._getBoxesAndLayout()
    this.setState(() => ({
      status: 'selectingPoints',
      startPoint: {
        left: layerX,
        top: layerY,
      },
      dims: {
        left: layerX,
        top: layerY,
        width: 0,
        height: 0,
      },
      boxesBoundaries: utils.memoizedGetBoxesBoundaries(boxes, layout),
    }))
  }

  setSelectionDimsAndBoundaries = (dx: number, dy: number) => {
    this.setState(({startPoint}) => {
      const left = dx > 0 ? startPoint.left : startPoint.left + dx
      const top = dy > 0 ? startPoint.top : startPoint.top + dy
      const width = Math.abs(dx)
      const height = Math.abs(dy)
      const dims = {left, top, width, height}
      return {
        dims,
        transformedSelectedArea: this._getTransformedSelectedArea(dims),
      }
    })
  }

  confirmSelectionDims = (dragHappened: boolean) => {
    if (dragHappened && Object.keys(this.selectedPoints).length > 0) {
      const {focus, duration, boxWidth} = this.props
      const {boxesBoundaries} = this.state
      const offsetTop = this.selectionZone!.offsetTop
      const variables: Variables = val(get(
        this.theater.atom2.pointer,
        this.props.pathToTimeline.concat('variables'),
      ) as Pointer<Variables>)
      this.setState(() => ({
        status: 'movingPoints',
        horizontalLimits: utils.getHorizontalLimits(
          this.selectedPoints,
          focus,
          boxWidth,
          variables,
        ),
        dims: utils.getFittedDims(
          this.selectedPoints,
          focus,
          duration,
          boxWidth,
          offsetTop,
          boxesBoundaries,
        ),
      }))
    } else {
      this._clearSelection()
    }
  }

  _clearSelection = () => {
    this.setState(
      () => SelectionProvider.defaultStateValues,
      () => {
        this.selectedPoints = {}
        this.extremumsOfVariablesInSelection = {}
      },
    )
  }

  addPointToSelection: TSelectionAPI['addPoint'] = (
    boxIndex,
    variableId,
    variableExtremums,
    pointIndex,
    pointData,
  ) => {
    const boxData = this.selectedPoints[boxIndex] || {}
    const variableData = boxData[variableId] || {}

    this.extremumsOfVariablesInSelection = {
      ...this.extremumsOfVariablesInSelection,
      [variableId]: variableExtremums,
    }
    this.selectedPoints = {
      ...this.selectedPoints,
      [boxIndex]: {
        ...boxData,
        [variableId]: {
          ...variableData,
          [pointIndex]: pointData,
        },
      },
    }
  }

  removePointFromSelection: TSelectionAPI['removePoint'] = (
    boxIndex,
    variableId,
    pointIndex,
  ) => {
    const {[boxIndex]: boxData, ...otherBoxes} = this.selectedPoints
    const {[variableId]: variableData, ...otherVariables} = boxData
    const {[pointIndex]: pointData, ...otherPoints} = variableData
    if (Object.keys(otherPoints).length > 0) {
      this.selectedPoints = {
        ...otherBoxes,
        [boxIndex]: {
          ...otherVariables,
          [variableId]: {
            ...otherPoints,
          },
        },
      }
    } else {
      if (Object.keys(otherVariables).length > 0) {
        this.selectedPoints = {
          ...otherBoxes,
          [boxIndex]: {...otherVariables},
        }
      } else {
        this.selectedPoints = {...otherBoxes}
      }
    }
  }

  api: TSelectionAPI = {
    addPoint: this.addPointToSelection,
    removePoint: this.removePointFromSelection,
  }

  areaMoveHandler = (dx: number, dy: number, e: MouseEvent) => {
    this.setState(({move, horizontalLimits}) => {
      let x = move.x + dx
      let y = move.y + dy

      if (e.altKey) x = this.state.move.x
      if (e.shiftKey) y = this.state.move.y

      if (x <= horizontalLimits.left) x = horizontalLimits.left + 1
      if (x >= horizontalLimits.right) x = horizontalLimits.right - 1

      return {move: {x, y}}
    })
  }

  _getZoneProps(status: IState['status']) {
    if (status === 'selectingPoints') {
      return {
        onWheel: disableEvent,
      }
    }
    if (status === 'movingPoints') {
      return {
        onWheel: disableEvent,
        onClick: disableEvent,
        onMouseDown: this.applyChangesToSelection,
      }
    }
    return {}
  }
}

export default SelectionProvider
