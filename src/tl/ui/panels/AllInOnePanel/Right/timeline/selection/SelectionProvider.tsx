import React from 'react'
import css from './SelectionProvider.css'
import {resolveCss} from '$shared/utils'
import {val} from '$shared/DataVerse2/atom'
import {Pointer} from '$shared/DataVerse2/pointer'
import * as utils from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/utils'
import {get} from 'lodash'
import {set} from 'lodash/fp'
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
import {
  internalTimelineToSeriesOfVerticalItems,
  PrimitivePropItem,
} from '$tl/ui/panels/AllInOnePanel/utils'
import memoizeOne from 'memoize-one'
import {
  TSelectionMove,
  TDims,
  THorizontalLimits,
  TTransformedSelectedArea,
  TItemsInfo,
  TSelectionAPI,
  TSelectedPoints,
  TExtremumsMap,
  TPointsOfItems,
} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import projectSelectors from '$tl/Project/store/selectors'
import {IBezierCurvesOfScalarValues} from '$tl/Project/store/types'

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
        [pointIndex]: pointData,
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
    const {layerX, layerY} = event.nativeEvent
    const itemsInfo = utils.memoizedGetItemsInfo(
      this._getFilteredItems(this.props.internalTimeline),
    )
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

  areaMoveHandler = (dx: number, dy: number, event: MouseEvent) => {
    this.setState(({move, horizontalLimits}) => {
      let x = move.x + dx
      let y = move.y + dy
      if (event.altKey) x = this.state.move.x
      if (event.shiftKey) y = this.state.move.y
      if (x <= horizontalLimits.left) x = horizontalLimits.left + 1
      if (x >= horizontalLimits.right) x = horizontalLimits.right - 1
      return {move: {x, y}}
    })
  }

  confirmSelectionDims = (dragHappened: boolean) => {
    if (dragHappened && Object.keys(this.selectedPoints).length > 0) {
      const {range, duration, timelineWidth} = this.props
      const horizontalLimits = utils.getHorizontalLimits(
        this.selectedPoints,
        timelineWidth,
        range,
        this._getPointsOfFilteredItems(
          this._getFilteredItems(this.props.internalTimeline),
        ),
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

  applyChangesToSelection = (event: React.MouseEvent<HTMLDivElement>) => {
    // disableEvent(e)
    // const {duration, range, timelineWidth} = this.props
    // const {move, boxesBoundaries} = this.state
    // const svgWidth = getSvgWidth(range, duration, timelineWidth)
    // const {boxes, layout} = this._getBoxesAndLayout()
    // this.dispatch(
    //   reduceHistoricState(
    //     this.props.pathToTimeline.concat('variables'),
    //     (variables: Variables) => {
    //       Object.keys(this.selectedPoints).forEach((boxKey: string) => {
    //         const boxInfo = this.selectedPoints[boxKey]
    //         const dopeSheet = boxes[layout[Number(boxKey)]].dopeSheet
    //         const boxHeight =
    //           boxesBoundaries[2 * Number(boxKey) + 1] -
    //           boxesBoundaries[2 * Number(boxKey)]
    //         Object.keys(boxInfo).forEach((variableKey: string) => {
    //           const variableInfo = boxInfo[variableKey]
    //           const extremums = this.extremumsOfItemsInSelection[
    //             variableKey
    //           ]
    //           const extDiff = extremums[1] - extremums[0]
    //           Object.keys(variableInfo).forEach((pointKey: string) => {
    //             const path = [variableKey, 'points', pointKey]
    //             const pointProps = get(variables, path)
    //             variables = set(
    //               path,
    //               {
    //                 ...pointProps,
    //                 time: pointProps.time + (move.x / svgWidth) * duration,
    //                 value:
    //                   pointProps.value -
    //                   (dopeSheet ? 0 : (move.y / boxHeight) * extDiff),
    //               },
    //               variables,
    //             )
    //           })
    //         })
    //       })
    //       return variables
    //     },
    //   ),
    // )
    // this._clearSelection()
  }

  _clearSelection = () => {
    this.setState(
      () => SelectionProvider.defaultStateValues,
      () => {
        this.selectedPoints = {}
        this.extremumsOfItemsInSelection = {}
      },
    )
  }

  _getFilteredItems = memoizeOne(
    (internalTimeline: InternalTimeline): PrimitivePropItem[] => {
      return internalTimelineToSeriesOfVerticalItems(
        this.ui,
        internalTimeline,
      ).filter(item => {
        if (item.type !== 'PrimitiveProp') return false
        const propState = projectSelectors.historic.getPropState(
          this.project.atomP.historic,
          item.address,
        )
        const valueContainer = val(propState.valueContainer)
        if (
          !valueContainer ||
          valueContainer.type !== 'BezierCurvesOfScalarValues'
        ) {
          return false
        }
        return true
      }) as PrimitivePropItem[]
    },
  )

  _getPointsOfFilteredItems = (
    filteredItems: PrimitivePropItem[],
  ): TPointsOfItems => {
    return filteredItems.reduce(
      (pointsOfItems, item) => {
        const propState = projectSelectors.historic.getPropState(
          this.project.atomP.historic,
          item.address,
        )
        const valueContainer = val(propState.valueContainer as Pointer<
          IBezierCurvesOfScalarValues
        >)
        return {
          ...pointsOfItems,
          [item.key]: valueContainer.points,
        }
      },
      {} as TPointsOfItems,
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
