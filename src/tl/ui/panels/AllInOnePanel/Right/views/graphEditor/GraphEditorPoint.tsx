import React from 'react'
import pointCss from '../point/point.css'
import Point from '$tl/ui/panels/AllInOnePanel/Right/views/point/Point'
import HandleLine from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/HandleLine'
import HandleClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/HandleClickArea'
import {TPropGetter} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import {
  TColor,
  TPointHandles,
  TPointSingleHandle,
  TNormalizedPoint,
  TPointCoords,
} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {
  ActiveModeContext,
  ActiveMode,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {
  TMovePointToNewCoords,
  TMoveSingleHandle,
  TFnNeedsPointIndex,
  TShowPointContextMenu,
  TShowPointValuesEditor,
  TAddPointToSelection,
  TRemovePointFromSelection,
  TPointMove,
  TMovePointToNewCoordsTemp,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {TTransformedSelectedArea} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {SVG_PADDING_Y} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'
import TempPoint from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/TempPoint'
import RenderBlocker from '$shared/components/RenderBlocker/RenderBlocker'
import {SelectedAreaContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import {shouldToggleIsInSelection} from '$tl/ui/panels/AllInOnePanel/Right/views/utils'
import {clamp} from 'lodash'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import PointCircle from '$theater/AnimationTimelinePanel/views/point/PointCircle'
import { cmdIsDown } from '$shared/utils/keyboardUtils';

interface IProps {
  propGetter: TPropGetter
  color: TColor
  pointIndex: number
  point: TNormalizedPoint
  prevPoint?: TNormalizedPoint
  nextPoint?: TNormalizedPoint
  removePoint: TFnNeedsPointIndex
  addConnector: TFnNeedsPointIndex
  movePointToNewCoords: TMovePointToNewCoords
  movePointToNewCoordsTemp: TMovePointToNewCoordsTemp
  moveLeftHandle: TMoveSingleHandle
  moveLeftHandleTemp: TMoveSingleHandle
  moveRightHandle: TMoveSingleHandle
  moveRightHandleTemp: TMoveSingleHandle
  makeLeftHandleHorizontal: TFnNeedsPointIndex
  makeRightHandleHorizontal: TFnNeedsPointIndex
  showPointValuesEditor: TShowPointValuesEditor
  showContextMenu: TShowPointContextMenu
  addPointToSelection: TAddPointToSelection
  removePointFromSelection: TRemovePointFromSelection
}

interface IState {
  isMoving: boolean
  pointMove: TPointMove
  handlesMove: TPointHandles
  renderTempConnectorOf: 'none' | 'currentPoint' | 'prevPoint'
}

export type TSVGSize = {width: number; height: number}

class GraphEditorPoint extends React.PureComponent<IProps, IState> {
  pointClickArea: React.RefObject<SVGRectElement> = React.createRef()
  activeMode: ActiveMode
  svgSize: TSVGSize
  leftHandleNormalizers: {xNormalizer: number; yNormalizer: number}
  rightHandleNormalizers: {xNormalizer: number; yNormalizer: number}
  cachedOriginalCoords: TPointCoords
  isInSelection: boolean = false

  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)

    this.state = {
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
      renderTempConnectorOf: 'none',
    }

    this.svgSize = getSVGSize(props.propGetter)
    this._cacheOriginalCoords()
  }

  render() {
    const {isMoving, renderTempConnectorOf, pointMove} = this.state
    return (
      <>
        {this._renderConsumers()}
        <g>
          {renderTempConnectorOf !== 'none' &&
            this._renderConnectorPlaceholder()}
          {isMoving && this._renderTempPoint(pointMove)}
          {this._renderPoint()}
        </g>
      </>
    )
  }

  _renderConsumers = () => {
    return (
      <RenderBlocker>
        <ActiveModeContext.Consumer>
          {this._setActiveMode}
        </ActiveModeContext.Consumer>
        <SelectedAreaContext.Consumer>
          {this._highlightAsSelected}
        </SelectedAreaContext.Consumer>
      </RenderBlocker>
    )
  }

  _renderPoint() {
    const {color, point, prevPoint, nextPoint} = this.props
    const handles = (prevPoint != null
      ? prevPoint.interpolationDescriptor.handles.slice(2)
      : [0, 0]
    ).concat(point.interpolationDescriptor.handles.slice(0, 2))

    const pointTime = point.time
    const pointValue = point.value

    const renderLeftHandle =
      prevPoint != null &&
      prevPoint.value !== pointValue &&
      prevPoint.interpolationDescriptor.connected
    const renderRightHandle =
      nextPoint != null &&
      nextPoint.value !== pointValue &&
      point.interpolationDescriptor.connected

    const leftHandle = renderLeftHandle
      ? [
          pointTime + handles[0] * (prevPoint!.time - pointTime),
          pointValue + handles[1] * (prevPoint!.value - pointValue),
        ]
      : []
    const rightHandle = renderRightHandle
      ? [
          pointTime + handles[2] * (nextPoint!.time - pointTime),
          pointValue + handles[3] * (nextPoint!.value - pointValue),
        ]
      : []
    return (
      <g>
        {renderLeftHandle && (
          <HandleLine
            x1={pointTime}
            y1={pointValue}
            x2={leftHandle[0]}
            y2={leftHandle[1]}
            color={color.darkened}
          />
        )}
        {renderRightHandle && (
          <HandleLine
            x1={pointTime}
            y1={pointValue}
            x2={rightHandle[0]}
            y2={rightHandle[1]}
            color={color.darkened}
          />
        )}
        <DraggableArea
          onDragStart={this.handlePointDragStart}
          onDrag={this.handlePointDrag}
          onDragEnd={this.handlePointDragEnd}
        >
          <g>
            <Point
              x={pointTime}
              y={pointValue}
              onClick={this.handleClickOnPoint}
              onContextMenu={this.handleContextMenu}
              onMouseMove={this.handlePointMouseMove}
              onMouseLeave={this.handlePointMouseLeave}
              ref={this.pointClickArea}
            />
          </g>
        </DraggableArea>
        {renderLeftHandle && (
          <DraggableArea
            onDragStart={this.handleLeftHandleDragStart}
            onDrag={this.handleLeftHandleDrag}
            onDragEnd={this.handleLeftHandleDragEnd}
          >
            <g>
              <HandleClickArea
                x={leftHandle[0]}
                y={leftHandle[1]}
                color={color.darkened}
                onClick={e => this.handleClickOnHandles(e, 'left')}
              />
            </g>
          </DraggableArea>
        )}
        {renderRightHandle && (
          <DraggableArea
            onDragStart={this.handleRightHandleDragStart}
            onDrag={this.handleRightHandleDrag}
            onDragEnd={this.handleRightHandleDragEnd}
          >
            <g>
              <HandleClickArea
                x={rightHandle[0]}
                y={rightHandle[1]}
                color={color.darkened}
                onClick={e => this.handleClickOnHandles(e, 'right')}
              />
            </g>
          </DraggableArea>
        )}
      </g>
    )
  }

  _renderTempPoint(pointMove: IState['pointMove']) {
    return (
      <TempPoint
        color={this.props.color}
        point={this.props.point}
        prevPoint={this.props.prevPoint}
        nextPoint={this.props.nextPoint}
        pointMove={pointMove}
        handlesMove={this.state.handlesMove}
      />
    )
  }

  _renderConnectorPlaceholder() {
    const {renderTempConnectorOf} = this.state
    const {point, prevPoint, nextPoint, color} = this.props
    if (renderTempConnectorOf === 'currentPoint') {
      if (nextPoint == null) return null
      if (point.interpolationDescriptor.connected) return null
      return (
        <g fill={color.darkened} stroke={color.darkened}>
          <BezierConnector
            leftPointTime={point.time}
            leftPointValue={point.value}
            rightPointTime={nextPoint.time}
            rightPointValue={nextPoint.value}
            handles={point.interpolationDescriptor.handles}
          />
        </g>
      )
    }
    if (renderTempConnectorOf === 'prevPoint') {
      if (prevPoint == null) return null
      if (prevPoint.interpolationDescriptor.connected) return null
      return (
        <>
          <g fill={color.darkened} stroke={color.darkened}>
            <BezierConnector
              leftPointTime={prevPoint.time}
              leftPointValue={prevPoint.value}
              rightPointTime={point.time}
              rightPointValue={point.value}
              handles={prevPoint.interpolationDescriptor.handles}
            />
          </g>
          <PointCircle x={prevPoint.time} y={prevPoint.value} />
        </>
      )
    }
    return null
  }

  handleClickOnPoint = (event: React.MouseEvent<SVGRectElement>) => {
    event.preventDefault()
    event.stopPropagation()
    switch (this.activeMode) {
      case MODES.c:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODES.cmd:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODES.d:
        this.props.removePoint(this.props.pointIndex)
        break
      default: {
        const {
          left,
          top,
          width,
          height,
        } = this.pointClickArea.current!.getBoundingClientRect()
        const params = {
          left: left + width / 2,
          top: top + height / 2,
          initialTime: this.props.point.originalTime,
          initialValue: this.props.point.originalValue,
          pointIndex: this.props.pointIndex,
        }
        this.props.showPointValuesEditor(params)
      }
    }
  }

  handleClickOnHandles = (
    e: React.MouseEvent<SVGRectElement>,
    side: 'left' | 'right',
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (this.activeMode === MODES.h) {
      if (side === 'left')
        this.props.makeLeftHandleHorizontal(this.props.pointIndex)
      if (side === 'right')
        this.props.makeRightHandleHorizontal(this.props.pointIndex)
    }
  }

  handlePointDragStart = () => {
    this.svgSize = getSVGSize(this.props.propGetter)
    this._cacheOriginalCoords()
  }

  handlePointDrag = (dx: number, dy: number, e: MouseEvent) => {
    const {width, height} = this.svgSize
    const {point, prevPoint, nextPoint} = this.props
    const {pointMove} = this.state

    let renderTempConnectorOf: IState['renderTempConnectorOf'] = 'none'
    let x = (dx / width) * 100
    let y = (dy / height) * 100
    if (cmdIsDown(e)) {
      renderTempConnectorOf = x > 0 ? 'currentPoint' : 'prevPoint'
      x = y = 0
    }
    if (e.altKey) x = 0
    if (e.shiftKey) y = 0

    const limitLeft = prevPoint == null ? 0 : prevPoint.time
    const limitRight = nextPoint == null ? 100 : nextPoint.time

    const pointTime = point.time - pointMove[0]
    const newT = pointTime + x
    if (newT >= limitRight) x = limitRight - pointTime - 100 / width
    if (newT <= limitLeft) x = limitLeft - pointTime + 100 / width
    const originalCoords = {
      time: this.cachedOriginalCoords.time,
      value: this.cachedOriginalCoords.value,
    }
    const change = {
      time: x - pointMove[0],
      value: y - pointMove[1],
    }
    this.cachedOriginalCoords = this.props.movePointToNewCoordsTemp(
      this.props.pointIndex,
      originalCoords,
      change,
    )
    this.setState(() => ({
      renderTempConnectorOf,
      isMoving: true,
      pointMove: [x, y],
    }))
  }

  handlePointDragEnd = (dragHappened: boolean) => {
    if (!dragHappened) return

    const coords = {
      time: this.props.point.originalTime,
      value: this.props.point.originalValue,
    }

    this.props.movePointToNewCoords(this.props.pointIndex, coords)

    const {renderTempConnectorOf} = this.state
    const {pointIndex, prevPoint, addConnector} = this.props
    if (renderTempConnectorOf === 'currentPoint') addConnector(pointIndex)
    if (renderTempConnectorOf === 'prevPoint' && prevPoint != null) {
      addConnector(pointIndex - 1)
    }

    this._resetState()
  }

  handleLeftHandleDragStart = () => {
    const {width, height} = getSVGSize(this.props.propGetter)
    const {point, prevPoint} = this.props
    this.leftHandleNormalizers = {
      xNormalizer: (prevPoint!.time - point.time) * width,
      yNormalizer: (prevPoint!.value - point.value) * height,
    }
  }

  handleLeftHandleDrag = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.leftHandleNormalizers
    const handlesMove: TPointHandles = [
      clampHandleMove(
        this.props.prevPoint!.interpolationDescriptor.handles[2] -
          this.state.handlesMove[0],
        (dx / xNormalizer) * 100,
      ),
      (dy / yNormalizer) * 100,
      0,
      0,
    ]
    const newHandle = this.props
      .prevPoint!.interpolationDescriptor.handles.slice(2)
      .map(
        (handle, i) => handle + handlesMove[i] - this.state.handlesMove[i],
      ) as TPointSingleHandle
    newHandle[0] = clamp(newHandle[0], 0, 1)
    this.props.moveLeftHandleTemp(this.props.pointIndex, newHandle)
    this.setState(() => ({
      isMoving: true,
      handlesMove,
    }))
  }

  handleLeftHandleDragEnd = () => {
    const newHandle = this.props.prevPoint!.interpolationDescriptor.handles.slice(
      2,
    ) as TPointSingleHandle
    this.props.moveLeftHandle(this.props.pointIndex, newHandle)
    this._resetState()
  }

  handleRightHandleDragStart = () => {
    const {width, height} = getSVGSize(this.props.propGetter)
    const {point, nextPoint} = this.props
    this.rightHandleNormalizers = {
      xNormalizer: (nextPoint!.time - point.time) * width,
      yNormalizer: (nextPoint!.value - point.value) * height,
    }
  }

  handleRightHandleDrag = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.rightHandleNormalizers
    const handlesMove = [
      0,
      0,
      clampHandleMove(
        this.props.point.interpolationDescriptor.handles[0] -
          this.state.handlesMove[2],
        (dx / xNormalizer) * 100,
      ),
      (dy / yNormalizer) * 100,
    ] as TPointHandles
    const newHandle = this.props.point.interpolationDescriptor.handles
      .slice(0, 2)
      .map(
        (handle, i) =>
          handle + handlesMove[i + 2] - this.state.handlesMove[i + 2],
      ) as TPointSingleHandle
    newHandle[0] = clamp(newHandle[0], 0, 1)
    this.props.moveRightHandleTemp(this.props.pointIndex, newHandle)
    this.setState(() => ({
      isMoving: true,
      handlesMove,
    }))
  }

  handleRightHandleDragEnd = () => {
    const newHandle = this.props.point.interpolationDescriptor.handles.slice(
      0,
      2,
    ) as TPointSingleHandle
    this.props.moveRightHandle(this.props.pointIndex, newHandle)
    this._resetState()
  }

  handleContextMenu = (e: React.MouseEvent<SVGRectElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.props.showContextMenu({
      left: clientX,
      top: clientY,
      pointIndex: this.props.pointIndex,
    })
  }

  handlePointMouseMove = () => {
    const {isMoving, renderTempConnectorOf} = this.state
    if (isMoving) return
    if (this.activeMode === MODES.cmd) {
      if (renderTempConnectorOf === 'none') {
        this.setState(() => ({renderTempConnectorOf: 'currentPoint'}))
      }
    } else {
      if (renderTempConnectorOf !== 'none') {
        this.setState(() => ({renderTempConnectorOf: 'none'}))
      }
    }
  }

  handlePointMouseLeave = () => {
    if (this.state.renderTempConnectorOf !== 'none') {
      this.setState(() => ({renderTempConnectorOf: 'none'}))
    }
  }

  _resetState() {
    this.setState(() => ({
      renderTempConnectorOf: 'none',
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  _setActiveMode = (activeMode: ActiveMode) => {
    this.activeMode = activeMode
    if (this.pointClickArea.current == null) return null
    if (activeMode === MODES.d) {
      this.pointClickArea.current.classList.add(pointCss.highlightRedOnHover)
    } else {
      this.pointClickArea.current.classList.remove(pointCss.highlightRedOnHover)
    }
    return null
  }

  _highlightAsSelected = (selectedArea: TTransformedSelectedArea) => {
    const itemKey = this.props.propGetter('itemKey')
    const {
      point: {time, value},
      pointIndex,
    } = this.props
    const pointCoords = {time, value}
    const shouldToggle = shouldToggleIsInSelection(
      pointCoords,
      this.isInSelection,
      selectedArea[itemKey],
    )
    if (shouldToggle && this.pointClickArea.current != null) {
      if (!this.isInSelection) {
        const didAdd = this.props.addPointToSelection(pointIndex, pointCoords)
        if (didAdd) {
          this.pointClickArea.current.classList.add(
            pointCss.highlightAsSelected,
          )
          this.isInSelection = true
        }
      } else {
        const didRemove = this.props.removePointFromSelection(pointIndex)
        if (didRemove) {
          this.pointClickArea.current.classList.remove(
            pointCss.highlightAsSelected,
          )
          this.isInSelection = false
        }
      }
    }
    return null
  }

  _cacheOriginalCoords() {
    this.cachedOriginalCoords = {
      time: this.props.point.originalTime,
      value: this.props.point.originalValue,
    }
  }
}

const clampHandleMove = (handleX: number, moveX: number) => {
  let handleMove = moveX
  if (handleMove + handleX > 1) handleMove = 1 - handleX
  if (handleMove + handleX < 0) handleMove = -handleX
  return handleMove
}

const getSVGSize = (propGetter: TPropGetter): TSVGSize => {
  const height = propGetter('itemHeight') - SVG_PADDING_Y
  const width = propGetter('svgWidth')
  return {width, height}
}

export default GraphEditorPoint
