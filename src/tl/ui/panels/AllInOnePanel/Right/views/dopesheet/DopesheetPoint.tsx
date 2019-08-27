import React from 'react'
import connectorCss from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/connector.css'
import pointCss from '$tl/ui/panels/AllInOnePanel/Right/views/point/point.css'
import {IColor} from '$tl/ui/panels/AllInOnePanel/Right/types'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import LineConnector from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnector'
import Point from '$tl/ui/panels/AllInOnePanel/Right/views/point/Point'
import {IPropGetter} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {
  ActiveModeContext,
  IActiveMode,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {
  IMovePointToNewCoords,
  IFnNeedsPointIndex,
  IMoveDopesheetConnector,
  IShowPointValuesEditor,
  IShowConnectorContextMenu,
  IShowPointContextMenu,
  IAddPointToSelection,
  IRemovePointFromSelection,
  IMovePointToNewCoordsTemp,
  IMoveDopesheetConnectorTemp,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import {ITransformedSelectedArea} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/types'
import {SelectedAreaContext} from '$tl/ui/panels/AllInOnePanel/Right/timeline/selection/SelectionProvider'
import TempPoint from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/TempPoint'
import TempConnector from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/TempConnector'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import {shouldToggleIsInSelection} from '$tl/ui/panels/AllInOnePanel/Right/views/utils'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import {cmdIsDown} from '$shared/utils/keyboardUtils'

interface IProps {
  propGetter: IPropGetter
  color: IColor
  prevPointTime?: number
  prevPointConnected?: boolean
  nextPointTime?: number
  nextPointConnected?: boolean
  nextNextPointTime?: number
  pointTime: number
  pointConnected: boolean
  originalTime: number
  originalValue: number
  pointIndex: number
  nextPointOriginalTime?: number
  removePoint: IFnNeedsPointIndex
  addConnector: IFnNeedsPointIndex
  movePointToNewCoords: IMovePointToNewCoords
  movePointToNewCoordsTemp: IMovePointToNewCoordsTemp
  removeConnector: IFnNeedsPointIndex
  moveConnector: IMoveDopesheetConnector
  moveConnectorTemp: IMoveDopesheetConnectorTemp
  showPointValuesEditor: IShowPointValuesEditor
  showPointContextMenu: IShowPointContextMenu
  showConnectorContextMenu: IShowConnectorContextMenu
  addPointToSelection: IAddPointToSelection
  removePointFromSelection: IRemovePointFromSelection
}

interface IState {
  isMovingConnector: boolean
  isMovingPoint: boolean
  connectorMove: number
  renderTempConnectorOf: 'none' | 'currentPoint' | 'prevPoint'
}

class DopesheetPoint extends React.PureComponent<IProps, IState> {
  pointClickArea: React.RefObject<SVGRectElement> = React.createRef()
  connectorClickArea: React.RefObject<SVGRectElement> = React.createRef()
  activeMode: IActiveMode
  isInSelection: boolean = false
  svgWidth: number = 0
  propsBeforeDrag: IProps

  constructor(props: IProps) {
    super(props)

    this.state = {
      isMovingConnector: false,
      connectorMove: 0,
      isMovingPoint: false,
      renderTempConnectorOf: 'none',
    }
  }

  render() {
    return (
      <>
        <PropsAsPointer>{this._renderConsumers}</PropsAsPointer>
        <g>
          {this.state.renderTempConnectorOf !== 'none' &&
            this._renderConnectorPlaceholder()}
          {this.state.isMovingPoint && this._renderTempPoint()}
          {this._renderPoint()}
          {this.state.isMovingConnector && this._renderTempConnector()}
        </g>
      </>
    )
  }

  _renderConsumers = () => {
    return (
      <>
        <ActiveModeContext.Consumer>
          {this._setActiveMode}
        </ActiveModeContext.Consumer>
        <SelectedAreaContext.Consumer>
          {this._highlightAsSelected}
        </SelectedAreaContext.Consumer>
      </>
    )
  }

  _renderPoint() {
    const {
      pointIndex,
      pointTime,
      pointConnected,
      nextPointTime,
      nextPointConnected,
      nextNextPointTime,
      color,
    } = this.props

    const connectorFill = pointIndex === 0 ? color.darkened : 'transparent'

    return (
      <>
        <g>
          {nextPointConnected && (
            <LineConnectorRect
              x={nextPointTime!}
              y={50}
              width={nextNextPointTime! - nextPointTime!}
              color={color.darkened}
            />
          )}
          {pointConnected && (
            <DraggableArea
              onDragStart={this.handleConnectorDragStart}
              onDrag={this.handleConnectorDrag}
              onDragEnd={this.handleConnectorDragEnd}
              lockCursorTo="ew-resize"
            >
              <g>
                <LineConnector
                  x={pointTime}
                  y={50}
                  width={nextPointTime! - pointTime}
                  color={connectorFill}
                  ref={this.connectorClickArea}
                  onClick={this.handleConnectorClick}
                  onContextMenu={this.handleConnectorContextMenu}
                />
              </g>
            </DraggableArea>
          )}
        </g>
        <DraggableArea
          onDragStart={this.handlePointDragStart}
          onDrag={this.handlePointDrag}
          onDragEnd={this.handlePointDragEnd}
          lockCursorTo="ew-resize"
        >
          <g>
            <Point
              x={pointTime}
              y={50}
              onClick={this.handlePointClick}
              onContextMenu={this.handlePointContextMenu}
              onMouseMove={this.handlePointMouseMove}
              onMouseLeave={this.handlePointMouseLeave}
              ref={this.pointClickArea}
              dopesheet={true}
            />
          </g>
        </DraggableArea>
      </>
    )
  }

  _renderTempPoint() {
    return (
      <TempPoint
        color={this.props.color}
        pointTime={this.propsBeforeDrag.pointTime}
        pointConnected={this.propsBeforeDrag.pointConnected}
        nextPointTime={this.propsBeforeDrag.nextPointTime}
        prevPointTime={this.propsBeforeDrag.prevPointTime}
        prevPointConnected={this.propsBeforeDrag.prevPointConnected}
      />
    )
  }

  _renderTempConnector() {
    return null
    const {connectorMove} = this.state
    return (
      <TempConnector
        color={this.props.color}
        pointTime={this.props.pointTime - connectorMove}
        nextPointTime={this.props.nextPointTime! - connectorMove}
        nextPointConnected={this.props.nextPointConnected!}
        nextNextPointTime={this.props.nextNextPointTime}
        prevPointTime={this.props.prevPointTime}
        prevPointConnected={this.props.prevPointConnected}
        move={connectorMove}
      />
    )
  }

  _renderConnectorPlaceholder() {
    const {renderTempConnectorOf} = this.state
    const {
      pointTime,
      pointConnected,
      prevPointTime,
      prevPointConnected,
      nextPointTime,
      color,
    } = this.props
    if (renderTempConnectorOf === 'currentPoint') {
      if (nextPointTime == null) return null
      if (pointConnected) return null
      return (
        <g fill={color.darkened} stroke={color.darkened}>
          <LineConnectorRect
            x={pointTime}
            y={50}
            width={nextPointTime - pointTime}
            color={color.darkened}
          />
        </g>
      )
    }
    if (renderTempConnectorOf === 'prevPoint') {
      if (prevPointTime == null) return null
      if (prevPointConnected) return null
      return (
        <>
          <LineConnectorRect
            x={prevPointTime}
            y={50}
            width={pointTime - prevPointTime}
            color={color.darkened}
          />
          <PointCircle x={prevPointTime} y={50} />
        </>
      )
    }
    return null
  }

  handlePointClick = (event: React.MouseEvent<SVGRectElement>) => {
    event.preventDefault()
    event.stopPropagation()
    switch (this.activeMode) {
      case MODES.c:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODES.super:
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
          initialTime: this.props.originalTime,
          initialValue: this.props.originalValue,
          pointIndex: this.props.pointIndex,
        }
        this.props.showPointValuesEditor(params)
      }
    }
  }

  handleConnectorClick = (event: React.MouseEvent<SVGRectElement>) => {
    if (this.activeMode === MODES.d) {
      event.stopPropagation()
      this.props.removeConnector(this.props.pointIndex)
    }
  }

  handlePointDragStart = () => {
    this.svgWidth = this.props.propGetter('svgWidth')
    this.propsBeforeDrag = this.props
  }

  handlePointDrag = (mouseDX: number, _: number, e: MouseEvent) => {
    const svgWidth = this.svgWidth
    let renderTempConnectorOf: IState['renderTempConnectorOf'] = 'none'

    let dxAsPercentageOfSvgWidth = (mouseDX / this.svgWidth) * 100
    if (cmdIsDown(e)) {
      renderTempConnectorOf =
        dxAsPercentageOfSvgWidth > 0 ? 'currentPoint' : 'prevPoint'
      dxAsPercentageOfSvgWidth = 0
    }

    const limitLeft =
      this.propsBeforeDrag.prevPointTime == null
        ? 0
        : this.propsBeforeDrag.prevPointTime
    const limitRight =
      this.propsBeforeDrag.nextPointTime == null
        ? 100 /* 100% of svgWidth */
        : this.propsBeforeDrag.nextPointTime

    const newTime = this.propsBeforeDrag.pointTime + dxAsPercentageOfSvgWidth

    if (newTime >= limitRight)
      dxAsPercentageOfSvgWidth =
        limitRight - this.propsBeforeDrag.pointTime - 100 / svgWidth
    if (newTime <= limitLeft)
      dxAsPercentageOfSvgWidth =
        limitLeft - this.propsBeforeDrag.pointTime + 100 / svgWidth

    const originalCoords = {
      time: this.propsBeforeDrag.originalTime,
      value: this.propsBeforeDrag.originalValue,
    }

    const change = {
      time: dxAsPercentageOfSvgWidth,
      value: 0,
    }

    const halfAPixelInTime = (0.4999 / svgWidth) * 100
    this.props.movePointToNewCoordsTemp(
      this.props.pointIndex,
      originalCoords,
      change,
      halfAPixelInTime,
      0,
    )

    this.setState(() => ({
      renderTempConnectorOf,
      isMovingPoint: true,
    }))
  }

  handlePointDragEnd = (dragHappened: true) => {
    if (!dragHappened) return
    const coords = {
      time: this.props.originalTime,
      value: this.props.originalValue,
    }
    this.props.movePointToNewCoords(this.props.pointIndex, coords)

    const {renderTempConnectorOf} = this.state
    const {pointIndex, prevPointTime, addConnector} = this.props
    if (renderTempConnectorOf === 'currentPoint') addConnector(pointIndex)
    if (renderTempConnectorOf === 'prevPoint' && prevPointTime != null) {
      addConnector(pointIndex - 1)
    }

    this.setState(() => ({
      renderTempConnectorOf: 'none',
      isMovingPoint: false,
    }))
  }

  handleConnectorDragStart = () => {
    this.svgWidth = this.props.propGetter('svgWidth')
    this.propsBeforeDrag = this.props
  }

  handleConnectorDrag = (mouseDX: number) => {
    let dxAsPercentageOfSvgWidth = (mouseDX / this.svgWidth) * 100

    const limitLeft =
      this.propsBeforeDrag.prevPointTime == null
        ? 0
        : this.propsBeforeDrag.prevPointTime
    const limitRight =
      this.propsBeforeDrag.nextNextPointTime == null
        ? 100
        : this.propsBeforeDrag.nextNextPointTime

    const leftPointTime =
      this.propsBeforeDrag.pointTime + dxAsPercentageOfSvgWidth
    const rightPointTime =
      this.propsBeforeDrag.nextPointTime! + dxAsPercentageOfSvgWidth

    if (rightPointTime >= limitRight)
      dxAsPercentageOfSvgWidth =
        limitRight - this.propsBeforeDrag.nextPointTime! - 100 / this.svgWidth

    if (leftPointTime <= limitLeft)
      dxAsPercentageOfSvgWidth =
        limitLeft - this.propsBeforeDrag.pointTime + 100 / this.svgWidth

    const originalTimes: [number, number] = [
      this.propsBeforeDrag.originalTime,
      this.propsBeforeDrag.nextPointOriginalTime!,
    ]

    this.props.moveConnectorTemp(
      this.props.pointIndex,
      originalTimes,
      dxAsPercentageOfSvgWidth,
    )
    this.setState(() => ({
      isMovingConnector: true,
      // connectorMove: dxAsPercentageOfSvgWidth,
    }))
  }

  handleConnectorDragEnd = (dragHappened: true) => {
    if (!dragHappened) return
    this.props.moveConnector(this.props.pointIndex)
    this.setState(() => ({
      isMovingConnector: false,
      // connectorMove: 0,
    }))
  }

  handlePointContextMenu = (event: React.MouseEvent<SVGRectElement>) => {
    event.stopPropagation()
    event.preventDefault()
    const {clientX, clientY} = event
    this.props.showPointContextMenu({
      left: clientX,
      top: clientY,
      pointIndex: this.props.pointIndex,
    })
  }

  handlePointMouseMove = () => {
    const {isMovingPoint, renderTempConnectorOf} = this.state
    if (isMovingPoint) return
    if (this.activeMode === MODES.super) {
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

  handleConnectorContextMenu = (event: React.MouseEvent<SVGRectElement>) => {
    event.stopPropagation()
    event.preventDefault()
    const {clientX, clientY} = event
    this.props.showConnectorContextMenu!({
      left: clientX,
      top: clientY,
      pointIndex: this.props.pointIndex,
    })
  }

  _setActiveMode = (activeMode: IActiveMode) => {
    this.activeMode = activeMode
    if (activeMode === MODES.d) {
      this.pointClickArea.current != null &&
        this.pointClickArea.current.classList.add(pointCss.highlightRedOnHover)
      this.connectorClickArea.current != null &&
        this.connectorClickArea.current.classList.add(
          connectorCss.highlightRedOnHover,
        )
      return null
    }
    if (activeMode === MODES.super) {
      this.connectorClickArea.current != null &&
        this.connectorClickArea.current.classList.add(connectorCss.ignoreMouse)
      return null
    }
    this.pointClickArea.current != null &&
      this.pointClickArea.current.classList.remove(pointCss.highlightRedOnHover)
    this.connectorClickArea.current != null &&
      this.connectorClickArea.current.classList.remove(
        connectorCss.highlightRedOnHover,
        connectorCss.ignoreMouse,
      )
    return null
  }

  _highlightAsSelected = (selectedArea: ITransformedSelectedArea) => {
    const itemKey = this.props.propGetter('itemKey')
    const {pointTime, pointIndex} = this.props
    const pointCoords = {time: pointTime, value: 50}
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
}

export default DopesheetPoint
