import React from 'react'
import connectorCss from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/connector.css'
import pointCss from '$tl/ui/panels/AllInOnePanel/Right/views/point/point.css'
import {TColor} from '$tl/ui/panels/AllInOnePanel/Right/types'
// import {
//   SelectedAreaChannel,
//   SelectionMoveChannel,
// } from '$tl/ui/panels/AllInOnePanel/Right/selection/SelectionProvider'
// import {
//   TTransformedSelectedArea,
//   TSelectionMove,
// } from '$tl/ui/panels/AllInOnePanel/Right/selection/types'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import LineConnectorRect from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnectorRect'
import LineConnector from '$tl/ui/panels/AllInOnePanel/Right/views/dopesheet/LineConnector'
import Point from '$tl/ui/panels/AllInOnePanel/Right/views/point/Point'
import {TPropGetter} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {
  ActiveModeContext,
  ActiveMode,
  MODES,
} from '$shared/components/ActiveModeProvider/ActiveModeProvider'
import {
  TMovePointToNewCoords,
  TFnNeedsPointIndex,
  TMoveDopesheetConnector,
  TShowPointValuesEditor,
  TShowConnectorContextMenu,
  TShowPointContextMenu,
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'

interface IProps {
  propGetter: TPropGetter
  color: TColor
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
  removePoint: TFnNeedsPointIndex
  addConnector: TFnNeedsPointIndex
  movePointToNewCoords: TMovePointToNewCoords
  removeConnector: TFnNeedsPointIndex
  moveConnector: TMoveDopesheetConnector
  showPointValuesEditor: TShowPointValuesEditor
  showPointContextMenu: TShowPointContextMenu
  showConnectorContextMenu: TShowConnectorContextMenu
  getValueRelativeToBoxHeight: () => number
  addPointToSelection: $FixMe /*TAddPointToSelection*/
  removePointFromSelection: $FixMe /*TRemovePointFromSelection*/
}

interface IState {
  isMovingConnector: boolean
  isMovingPoint: boolean
  connectorMove: number
  pointMove: number
}

class DopesheetPoint extends React.PureComponent<IProps, IState> {
  isSelected: boolean = false
  pointClickArea: React.RefObject<SVGRectElement> = React.createRef()
  connectorClickArea: React.RefObject<SVGRectElement> = React.createRef()
  svgWidth: number = 0
  activeMode: ActiveMode

  state = {
    isMovingConnector: false,
    connectorMove: 0,
    isMovingPoint: false,
    pointMove: 0,
  }

  render() {
    const {
      pointIndex,
      pointTime,
      pointConnected,
      nextPointTime,
      nextPointConnected,
      nextNextPointTime,
      color,
    } = this.props
    const {
      isMovingConnector,
      isMovingPoint,
      connectorMove,
      pointMove,
    } = this.state

    const connectorFill = pointIndex === 0 ? color.darkened : 'transparent'
    return (
      <>
        {/*
        <Subscriber channel={SelectedAreaChannel}>
          {this._highlightAsSelected}
        </Subscriber> */}
        <ActiveModeContext.Consumer>
          {this._setActiveMode}
        </ActiveModeContext.Consumer>
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
              onDragStart={this.connectorDragStartHandler}
              onDrag={this.connectorDragHandler}
              onDragEnd={this.connectorDragEndHandler}
            >
              <g>
                <LineConnector
                  x={pointTime}
                  y={50}
                  width={nextPointTime! - pointTime}
                  color={connectorFill}
                  ref={this.connectorClickArea}
                  onClick={this.connectorClickHandler}
                  onContextMenu={this.handleConnectorContextMenu}
                />
              </g>
            </DraggableArea>
          )}
        </g>
        {isMovingConnector && this._renderMovingConnector(connectorMove)}
        {isMovingPoint && this._renderMovingPoint(pointMove)}
        {/* <Subscriber channel={SelectionMoveChannel}>
          {this._handleSelectionMove}
        </Subscriber> */}
        <DraggableArea
          onDragStart={this.pointDragStartHandler}
          onDrag={this.pointDragHandler}
          onDragEnd={this.pointDragEndHandler}
        >
          <g>
            <Point
              x={pointTime}
              y={50}
              onClick={this.pointClickHandler}
              onContextMenu={this.handlePointContextMenu}
              ref={this.pointClickArea}
            />
          </g>
        </DraggableArea>
      </>
    )
  }

  _renderMovingConnector(move: number) {
    const {
      pointTime,
      nextPointTime,
      nextPointConnected,
      prevPointConnected,
      color,
    } = this.props

    return (
      <g>
        {prevPointConnected &&
          move > 0 && (
            <LineConnectorRect
              x={pointTime}
              y={50}
              width={move}
              color={color.darkened}
            />
          )}
        {nextPointConnected &&
          move < 0 && (
            <LineConnectorRect
              x={nextPointTime! + move}
              y={50}
              width={-move}
              color={color.darkened}
            />
          )}
        <LineConnectorRect
          x={pointTime + move}
          y={50}
          width={nextPointTime! - pointTime}
          color={color.darkened}
        />
        <g opacity={0.7}>
          <PointCircle x={pointTime + move} y={50} />
          <PointCircle x={nextPointTime! + move} y={50} />
        </g>
      </g>
    )
  }

  _renderMovingPoint(move: number) {
    const {pointTime, prevPointConnected, pointConnected, color} = this.props

    return (
      <g>
        {prevPointConnected &&
          move > 0 && (
            <LineConnectorRect
              x={pointTime}
              y={50}
              width={move}
              color={color.darkened}
            />
          )}
        {pointConnected &&
          move < 0 && (
            <LineConnectorRect
              x={pointTime + move}
              y={50}
              width={-move}
              color={color.darkened}
            />
          )}
        <g opacity={0.7}>
          <PointCircle x={pointTime + move} y={50} />
        </g>
      </g>
    )
  }

  _setActiveMode = (activeMode: ActiveMode) => {
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
    if (activeMode === MODES.cmd) {
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

  _highlightAsSelected = (
    selectedArea: $FixMe /*TTransformedSelectedArea*/,
  ) => {
    // TODO: Fix Me
    // const boxIndex = this.props.propGetter('boxIndex')
    const boxIndex = 0
    let shouldUpdateHighlightAsSelectedClass = false
    if (selectedArea[boxIndex] == null) {
      if (this.isSelected) {
        this.isSelected = false
        shouldUpdateHighlightAsSelectedClass = true
      }
    } else {
      const {pointTime, getValueRelativeToBoxHeight} = this.props
      const pointValue = getValueRelativeToBoxHeight()
      const {left, top, right, bottom} = selectedArea[boxIndex]
      if (
        left <= pointTime &&
        pointTime <= right &&
        top <= pointValue &&
        pointValue <= bottom
      ) {
        if (!this.isSelected) {
          this.isSelected = true
          shouldUpdateHighlightAsSelectedClass = true
        }
      } else {
        if (this.isSelected) {
          this.isSelected = false
          shouldUpdateHighlightAsSelectedClass = true
        }
      }
    }

    if (
      shouldUpdateHighlightAsSelectedClass &&
      this.pointClickArea.current != null
    ) {
      if (this.isSelected) {
        this.pointClickArea.current.classList.add(pointCss.highlightAsSelected)
        this.props.addPointToSelection(this.props.pointIndex, {
          time: this.props.pointTime,
          value: this.props.getValueRelativeToBoxHeight(),
        })
      } else {
        this.pointClickArea.current.classList.remove(
          pointCss.highlightAsSelected,
        )
        this.props.removePointFromSelection(this.props.pointIndex)
      }
    }
    return null
  }

  pointClickHandler = (event: React.MouseEvent<SVGRectElement>) => {
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
          initialTime: this.props.originalTime,
          initialValue: this.props.originalValue,
          pointIndex: this.props.pointIndex,
        }
        this.props.showPointValuesEditor(params)
      }
    }
  }

  connectorClickHandler = (event: React.MouseEvent<SVGRectElement>) => {
    if (this.activeMode === MODES.d) {
      event.stopPropagation()
      this.props.removeConnector(this.props.pointIndex)
    }
  }

  connectorDragStartHandler = () => {
    this.svgWidth = this.props.propGetter('svgWidth')
  }

  connectorDragHandler = (dx: number) => {
    let x = (dx / this.svgWidth) * 100

    const {
      pointTime,
      prevPointTime,
      nextPointTime,
      nextNextPointTime,
    } = this.props
    const limitLeft = prevPointTime == null ? 0 : prevPointTime
    const limitRight = nextNextPointTime == null ? 100 : nextNextPointTime

    if (nextPointTime! + x >= limitRight)
      x = limitRight - nextPointTime! - 100 / this.svgWidth
    if (pointTime + x <= limitLeft)
      x = limitLeft - pointTime + 100 / this.svgWidth

    this.setState(() => ({
      isMovingConnector: true,
      connectorMove: x,
    }))
  }

  connectorDragEndHandler = (dragHappened: true) => {
    if (!dragHappened) return
    this.props.moveConnector(this.props.pointIndex, this.state.connectorMove)
    this.setState(() => ({
      isMovingConnector: false,
      connectorMove: 0,
    }))
  }

  pointDragStartHandler = () => {
    this.svgWidth = this.props.propGetter('svgWidth')
  }

  pointDragHandler = (dx: number) => {
    let x = (dx / this.svgWidth) * 100

    const {pointTime, prevPointTime, nextPointTime} = this.props
    const limitLeft = prevPointTime == null ? 0 : prevPointTime
    const limitRight = nextPointTime == null ? 100 : nextPointTime

    const newTime = pointTime + x
    if (newTime >= limitRight) x = limitRight - pointTime - 100 / this.svgWidth
    if (newTime <= limitLeft) x = limitLeft - pointTime + 100 / this.svgWidth

    this.setState(() => ({
      isMovingPoint: true,
      pointMove: x,
    }))
  }

  pointDragEndHandler = (dragHappened: true) => {
    if (!dragHappened) return
    const originalCoords = {
      time: this.props.originalTime,
      value: this.props.originalValue,
    }
    const change = {
      time: this.state.pointMove,
      value: 0,
    }
    this.props.movePointToNewCoords(
      this.props.pointIndex,
      originalCoords,
      change,
    )
    this.setState(() => ({
      isMovingPoint: false,
      pointMove: 0,
    }))
  }

  _handleSelectionMove = ({x}: $FixMe /*TSelectionMove*/) => {
    if (this.isSelected) {
      const svgWidth = this.props.propGetter('svgWidth')
      return this._renderMovingPoint((x / svgWidth) * 100)
    }
    return null
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
}

export default DopesheetPoint
