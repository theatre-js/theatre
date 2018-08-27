import React from 'react'
import css from './SelectionProvider.css'
import {resolveCss} from '$shared/utils'
import {val} from '$shared/DataVerse2/atom'
import * as utils from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/utils'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import UIComponent from '$tl/ui/handy/UIComponent'
import {
  ActiveModeContext,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {getSvgWidth} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import noop from '$shared/utils/noop'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {internalTimelineToSeriesOfVerticalItems} from '$tl/ui/panels/AllInOnePanel/utils'
import {
  TSelectionMove,
  TDims,
  THorizontalLimits,
  TTransformedSelectedArea,
  TItemsInfo,
  TSelectionAPI,
  TSelectedPoints,
  TExtremumsMap,
  // TPointsOfItems,
  TCollectionOfSelectedPointsData,
  TMapOfFilteredItemKeyToItemData,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import projectSelectors from '$tl/Project/store/selectors'
import {svgPaddingY} from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditorWrapper'

const classes = resolveCss(css)

interface IExportedComponentProps {
  children: React.ReactNode
}

interface ISelectionProviderProps extends IExportedComponentProps {
  range: TRange
  duration: TDuration
  timelineWidth: number
  internalTimeline: InternalTimeline
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
  itemsInfo: TItemsInfo
}

export const SelectionAPIContext = React.createContext<TSelectionAPI>({
  addPoint: noop,
  removePoint: noop,
})
export const SelectedAreaContext = React.createContext<
  TTransformedSelectedArea
>({})
export const SelectionMoveContext = React.createContext<TSelectionMove>({
  x: 0,
  y: 0,
})

class SelectionProvider extends UIComponent<ISelectionProviderProps, IState> {
  selectedPoints: TSelectedPoints = {}
  extremumsOfItemsInSelection: TExtremumsMap = {}
  mapOfItemsData: TMapOfFilteredItemKeyToItemData = {}
  tempActionGroup = this.project._actions.historic.temp()

  static defaultStateValues: IState = {
    status: 'noSelection',
    move: {x: 0, y: 0},
    startPoint: {left: 0, top: 0},
    dims: {left: 0, top: 0, width: 0, height: 0},
    transformedSelectedArea: {},
    itemsInfo: {boundaries: [], keys: []},
    horizontalLimits: {left: -Infinity, right: Infinity},
  }

  state = SelectionProvider.defaultStateValues

  render() {
    return (
      <ActiveModeContext.Consumer>
        {activeMode => {
          const renderSelectionArea =
            activeMode === MODES.shift || this.state.status !== 'noSelection'
          return renderSelectionArea
            ? this._renderSelectionArea()
            : this._renderContextProviders()
        }}
      </ActiveModeContext.Consumer>
    )
  }

  _renderSelectionArea() {
    const {status, move, dims} = this.state
    const {duration, range, timelineWidth} = this.props
    const statusIsMovingPoints = status === 'movingPoints'
    const svgWidth = getSvgWidth(range, duration, timelineWidth)
    return (
      <>
        {this._renderContextProviders()}
        <div {...classes('selectionContainer')} style={{width: svgWidth}}>
          <DraggableArea
            shouldRegisterEvents={!statusIsMovingPoints}
            onDragStart={this.activateSelection}
            onDrag={this.setSelectionDimsAndBoundaries}
            onDragEnd={this.confirmSelectionDims}
          >
            <div
              {...classes('selectionZone', statusIsMovingPoints && 'confirm')}
              {...this._getZoneProps(status)}
              style={{width: timelineWidth}}
            >
              <DraggableArea
                shouldRegisterEvents={statusIsMovingPoints}
                onDrag={this.handleAreaMove}
              >
                <div
                  style={{transform: `translate3d(${move.x}px,${move.y}px,0)`}}
                >
                  <div
                    {...classes(
                      'selectedArea',
                      statusIsMovingPoints && 'movable',
                    )}
                    style={dims}
                  />
                </div>
              </DraggableArea>
            </div>
          </DraggableArea>
        </div>
      </>
    )
  }

  _renderContextProviders() {
    return (
      <SelectionAPIContext.Provider value={this.api}>
        <SelectedAreaContext.Provider
          value={this.state.transformedSelectedArea}
        >
          <SelectionMoveContext.Provider value={this.state.move}>
            {this.props.children}
          </SelectionMoveContext.Provider>
        </SelectedAreaContext.Provider>
      </SelectionAPIContext.Provider>
    )
  }

  addPointToSelection: TSelectionAPI['addPoint'] = (
    itemKey,
    pointIndex,
    extremums,
    pointData,
  ) => {
    this.extremumsOfItemsInSelection = {
      ...this.extremumsOfItemsInSelection,
      [itemKey]: extremums,
    }
    const itemData = this.selectedPoints[itemKey] || {}
    this.selectedPoints = {
      ...this.selectedPoints,
      [itemKey]: {
        ...itemData,
        [pointIndex]: {...pointData},
      },
    }
  }

  removePointFromSelection: TSelectionAPI['removePoint'] = (
    itemKey,
    pointIndex,
  ) => {
    delete this.selectedPoints[itemKey][pointIndex]
    if (Object.keys(this.selectedPoints[itemKey]).length === 0) {
      delete this.selectedPoints[itemKey]
    }
  }

  api: TSelectionAPI = {
    addPoint: this.addPointToSelection,
    removePoint: this.removePointFromSelection,
  }

  activateSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    this.mapOfItemsData = this._getMapOfItemsData(this.props.internalTimeline)
    const {layerX, layerY} = event.nativeEvent
    const itemsInfo = utils.memoizedGetItemsInfo(this.mapOfItemsData)
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
      itemsInfo,
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

  handleAreaMove = (x: number, y: number) => {
    const {horizontalLimits} = this.state
    if (x <= horizontalLimits.left) x = horizontalLimits.left + 1
    if (x >= horizontalLimits.right) x = horizontalLimits.right - 1

    this.setState(() => ({move: {x, y}}), this.applyChangesToSelectionTemp)
  }

  confirmSelectionDims = (dragHappened: boolean) => {
    if (dragHappened && Object.keys(this.selectedPoints).length > 0) {
      const {range, duration, timelineWidth} = this.props
      const horizontalLimits = utils.getHorizontalLimits(
        this.selectedPoints,
        timelineWidth,
        range,
        this.mapOfItemsData,
      )

      const fittedDims = utils.getFittedDims(
        this.selectedPoints,
        range,
        duration,
        timelineWidth,
        this.state.itemsInfo,
      )
      this.setState(() => ({
        status: 'movingPoints',
        horizontalLimits,
        dims: fittedDims,
      }))
    } else {
      this._clearSelection()
    }
  }

  applyChangesToSelectionTemp = () => {
    this.project.reduxStore.dispatch(
      this.tempActionGroup.push(
        this.project._actions.historic.moveSelectionOfPointsInBezierCurvesOfScalarValues(
          this._getPointsInSelectionDataAfterMove(),
        ),
      ),
    )
  }

  applyChangesToSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    disableEvent(event)
    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.moveSelectionOfPointsInBezierCurvesOfScalarValues(
          this._getPointsInSelectionDataAfterMove(),
        ),
      ]),
    )
    this._clearSelection()
  }

  _clearSelection = () => {
    this.setState(
      () => SelectionProvider.defaultStateValues,
      () => {
        this.selectedPoints = {}
        this.mapOfItemsData = {}
        this.extremumsOfItemsInSelection = {}
      },
    )
  }

  _getPointsInSelectionDataAfterMove() {
    const {duration, range, timelineWidth} = this.props
    const {move} = this.state

    const svgWidth = getSvgWidth(range, duration, timelineWidth)

    const timeChange = (move.x / svgWidth) * duration

    return Object.entries(this.selectedPoints).reduce(
      (pointsDataAfterMove, [itemKey, selectedPointsData]) => {
        const itemData = this.mapOfItemsData[itemKey]
        const itemExtremums = this.extremumsOfItemsInSelection[itemKey]
        const extDiff = itemExtremums[1] - itemExtremums[0]
        const valueChange = (move.y / (itemData.height - svgPaddingY)) * extDiff
        const pointsNewCoords: TCollectionOfSelectedPointsData = {}

        Object.keys(selectedPointsData).forEach(pointIndex => {
          const originalPoint = itemData.points[Number(pointIndex)]
          pointsNewCoords[pointIndex] = {
            time: originalPoint.time + timeChange,
            ...(itemData.expanded
              ? {value: originalPoint.value - valueChange}
              : {}),
          }
        })

        return [
          ...pointsDataAfterMove,
          {
            propAddress: itemData.address,
            pointsNewCoords,
          },
        ]
      },
      [],
    )
  }

  _getMapOfItemsData = (
    internalTimeline: InternalTimeline,
  ): TMapOfFilteredItemKeyToItemData => {
    return internalTimelineToSeriesOfVerticalItems(
      this.ui,
      internalTimeline,
    ).reduce(
      (mapOfItemsData, item) => {
        if (item.type !== 'PrimitiveProp') return mapOfItemsData
        const propState = projectSelectors.historic.getPropState(
          this.project.atomP.historic,
          item.address,
        )
        const valueContainer = val(propState.valueContainer)
        if (
          !valueContainer ||
          valueContainer.type !== 'BezierCurvesOfScalarValues'
        ) {
          return mapOfItemsData
        }

        return {
          ...mapOfItemsData,
          [item.key]: {
            address: item.address,
            top: item.top,
            height: item.height,
            expanded: item.expanded,
            points: valueContainer.points,
          },
        }
      },
      {} as TMapOfFilteredItemKeyToItemData,
    )
  }

  _getTransformedSelectedArea(dims: TDims): TTransformedSelectedArea {
    const {range, duration, timelineWidth} = this.props
    const {itemsInfo} = this.state
    return utils.getTransformedSelectedArea(
      dims,
      range,
      duration,
      timelineWidth,
      itemsInfo,
    )
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

const disableEvent = (event: React.MouseEvent<HTMLDivElement>) => {
  event.stopPropagation()
  event.preventDefault()
}

export default (props: IExportedComponentProps) => (
  <AllInOnePanelStuff>
    {allInOnePanelStuffP => (
      <PropsAsPointer>
        {() => {
          const internalTimeline = val(allInOnePanelStuffP.internalTimeline)
          const range = val(
            internalTimeline!.pointerToRangeState.rangeShownInPanel,
          )
          const duration = val(internalTimeline!.pointerToRangeState.duration)
          const width = val(allInOnePanelStuffP.rightWidth)
          const selectionProviderProps: ISelectionProviderProps = {
            range,
            duration,
            timelineWidth: width,
            internalTimeline: internalTimeline!,
            ...props,
          }
          return <SelectionProvider {...selectionProviderProps} />
        }}
      </PropsAsPointer>
    )}
  </AllInOnePanelStuff>
)
