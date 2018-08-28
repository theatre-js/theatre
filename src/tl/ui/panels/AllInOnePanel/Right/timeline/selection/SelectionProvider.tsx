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
  TLastCommittedData,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import projectSelectors from '$tl/Project/store/selectors'
import {svgPaddingY} from '$tl/ui/panels/AllInOnePanel/Right/views/GraphEditorWrapper'
import Overlay from '$shared/components/Overlay/Overlay'
import OverlaySection from '$shared/components/Overlay/OverlaySection'

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
  status:
    | 'noSelection'
    | 'selectingPoints'
    | 'movingPoints'
    | 'committingChanges'
    | 'confirmedSelection'
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
  addPoint: () => true,
  removePoint: () => true,
  getSelectedPointsOfItem: () => ({}),
})
export const SelectedAreaContext = React.createContext<
  TTransformedSelectedArea
>({})
export const SelectionStatusContext = React.createContext<IState['status']>(
  'noSelection',
)

class SelectionProvider extends UIComponent<ISelectionProviderProps, IState> {
  selectedPoints: TSelectedPoints = {}
  extremumsOfItemsInSelection: TExtremumsMap = {}
  mapOfItemsData: TMapOfFilteredItemKeyToItemData = {}
  tempActionGroup = this.project._actions.historic.temp()
  lastCommittedData: TLastCommittedData

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
    const {status} = this.state
    return (
      <>
        {this._renderContextProviders()}
        <ActiveModeContext.Consumer>
          {activeMode => activeMode === MODES.shift && this._renderHitZone()}
        </ActiveModeContext.Consumer>
        {status !== 'noSelection' && this._renderSelectedArea()}
      </>
    )
  }

  _renderContextProviders() {
    return (
      <SelectionAPIContext.Provider value={this.api}>
        <SelectedAreaContext.Provider
          value={this.state.transformedSelectedArea}
        >
          <SelectionStatusContext.Provider value={this.state.status}>
            {this.props.children}
          </SelectionStatusContext.Provider>
        </SelectedAreaContext.Provider>
      </SelectionAPIContext.Provider>
    )
  }

  _renderHitZone() {
    return (
      <DraggableArea
        onDragStart={this.activateSelection}
        onDrag={this.setSelectionDimsAndBoundaries}
        onDragEnd={this.confirmSelectionDims}
      >
        <div {...classes('hitZone')} />
      </DraggableArea>
    )
  }

  _renderSelectedArea() {
    const {status, move, dims} = this.state
    const statusIsConfirmedSelection = status === 'confirmedSelection'

    const areaIsMovable =
      statusIsConfirmedSelection ||
      status === 'movingPoints' ||
      status === 'committingChanges'

    return (
      <div {...classes('container')}>
        <Overlay
          onClickOutside={this._clearSelection}
          propagateWheel={true}
          propagateMouseDown={true}
        >
          <OverlaySection>
            <DraggableArea
              onDragStart={this.handleAreaDragStart}
              onDrag={this.handleAreaDrag}
              onDragEnd={this.handleAreaDragEnd}
            >
              <div
                style={{
                  transform: `translate3d(${move.x}px, ${move.y}px, 0)`,
                }}
              >
                <div
                  {...classes(
                    'areaOverlay',
                    areaIsMovable && 'movable',
                    statusIsConfirmedSelection && 'hasTransition',
                  )}
                  style={dims}
                />
              </div>
            </DraggableArea>
          </OverlaySection>
        </Overlay>
      </div>
    )
  }

  addPointToSelection: TSelectionAPI['addPoint'] = (
    itemKey,
    pointIndex,
    extremums,
    pointData,
  ) => {
    if (
      this.state.status === 'committingChanges' &&
      this.selectedPoints[itemKey][pointIndex] == null
    ) {
      return false
    }

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
    return true
  }

  removePointFromSelection: TSelectionAPI['removePoint'] = (
    itemKey,
    pointIndex,
  ) => {
    const {status} = this.state
    if (status === 'selectingPoints' || status === 'noSelection') {
      delete this.selectedPoints[itemKey][pointIndex]
      if (Object.keys(this.selectedPoints[itemKey]).length === 0) {
        delete this.selectedPoints[itemKey]
      }
      return true
    }
    return false
  }

  getSelectedPointsOfItem: TSelectionAPI['getSelectedPointsOfItem'] = itemKey => {
    return this.selectedPoints[itemKey]
  }

  api: TSelectionAPI = {
    addPoint: this.addPointToSelection,
    removePoint: this.removePointFromSelection,
    getSelectedPointsOfItem: this.getSelectedPointsOfItem,
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

  handleAreaDragStart = () => {
    this.setState(() => ({
      status: 'movingPoints',
    }))
  }

  handleAreaDrag = (x: number, y: number, event: MouseEvent) => {
    const {horizontalLimits} = this.state

    if (x <= horizontalLimits.left) x = horizontalLimits.left + 1
    if (x >= horizontalLimits.right) x = horizontalLimits.right - 1

    if (event.shiftKey) x = 0
    if (event.altKey) y = 0

    this.setState(() => ({move: {x, y}}), this.applyChangesToSelectionTemp)
  }

  handleAreaDragEnd = () => {
    this.setState(
      () => ({
        status: 'committingChanges',
      }),
      this.applyChangesToSelection,
    )
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
        status: 'confirmedSelection',
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

  applyChangesToSelection = () => {
    this.project.reduxStore.dispatch(
      this.project._actions.batched([
        this.tempActionGroup.discard(),
        this.project._actions.historic.moveSelectionOfPointsInBezierCurvesOfScalarValues(
          this.lastCommittedData,
        ),
      ]),
    )
    this._updateSelectionState()
  }

  _clearSelection = () => {
    this.setState(
      () => SelectionProvider.defaultStateValues,
      () => {
        this.selectedPoints = {}
        this.mapOfItemsData = {}
        this.extremumsOfItemsInSelection = {}
        this.lastCommittedData = []
      },
    )
  }

  _updateSelectionState() {
    const {range, duration, timelineWidth} = this.props
    const {itemsInfo} = this.state
    this.mapOfItemsData = this._getMapOfItemsData(this.props.internalTimeline)
    const dims = utils.getFittedDims(
      this.selectedPoints,
      range,
      duration,
      timelineWidth,
      itemsInfo,
    )

    const startPoint = {left: dims.left, top: dims.top}

    const transformedSelectedArea = utils.getTransformedSelectedArea(
      dims,
      range,
      duration,
      timelineWidth,
      itemsInfo,
    )
    const horizontalLimits = utils.getHorizontalLimits(
      this.selectedPoints,
      timelineWidth,
      range,
      this.mapOfItemsData,
    )

    this.setState(() => ({
      move: {x: 0, y: 0},
      startPoint,
      dims,
      transformedSelectedArea,
      itemsInfo,
      horizontalLimits,
    }))
  }

  _getPointsInSelectionDataAfterMove() {
    const {duration, range, timelineWidth} = this.props
    const {move} = this.state

    const svgWidth = getSvgWidth(range, duration, timelineWidth)

    const timeChange = (move.x / svgWidth) * duration

    return (this.lastCommittedData = Object.entries(this.selectedPoints).reduce(
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
    ))
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
