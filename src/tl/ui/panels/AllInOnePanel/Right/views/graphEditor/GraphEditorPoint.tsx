import React from 'react'
import pointCss from '../point/point.css'
// import {
//   removeGlobalPointDragRule,
//   addGlobalPointDragRule,
// } from '$tl/ui/panels/AllInOnePanel/Right/utils'
// import {
//   SelectedAreaChannel,
//   SelectionMoveChannel,
// } from '$tl/ui/panels/AllInOnePanel/Right/selection/SelectionProvider'
// import {
//   TTransformedSelectedArea,
//   TSelectionMove,
// } from '$tl/ui/panels/AllInOnePanel/Right/selection/types'
// import {
//   TShowPointValuesEditor,
//   TShowPointContextMenu,
//   TRemovePointFromSelection,
//   TAddPointToSelection,
// } from '$tl/ui/panels/AllInOnePanel/Right/views/types'
import Point from '$tl/ui/panels/AllInOnePanel/Right/views/point/Point'
import PointCircle from '$tl/ui/panels/AllInOnePanel/Right/views/point/PointCircle'
import HandleLine from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/HandleLine'
import HandleClickArea from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/HandleClickArea'
import BezierConnector from '$tl/ui/panels/AllInOnePanel/Right/views/graphEditor/BezierConnector'
import {TPropGetter} from '$tl/ui/panels/AllInOnePanel/Right/items/ItemPropProvider'
import {
  TColor,
  TPointHandles,
  TPointSingleHandle,
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
} from '$tl/ui/panels/AllInOnePanel/Right/views/types'

interface IProps {
  propGetter: TPropGetter
  color: TColor
  prevPointTime?: number
  prevPointValue?: number
  prevPointHandles?: TPointHandles
  prevPointConnected?: boolean
  nextPointTime?: number
  nextPointValue?: number
  pointTime: number
  pointValue: number
  pointHandles: TPointHandles
  pointConnected: boolean
  originalTime: number
  originalValue: number
  pointIndex: number
  removePoint: TFnNeedsPointIndex
  addConnector: TFnNeedsPointIndex
  movePointToNewCoords: TMovePointToNewCoords
  moveLeftHandle: TMoveSingleHandle
  moveRightHandle: TMoveSingleHandle
  makeLeftHandleHorizontal: TFnNeedsPointIndex
  makeRightHandleHorizontal: TFnNeedsPointIndex
  showPointValuesEditor: $FixMe /*TShowPointValuesEditor*/
  showContextMenu: $FixMe /*TShowPointContextMenu*/
  addPointToSelection: $FixMe /*TAddPointToSelection*/
  removePointFromSelection: $FixMe /*TRemovePointFromSelection*/
}

interface IState {
  isMoving: boolean
  pointMove: [number, number]
  handlesMove: TPointHandles
}

export type TSVGSize = {width: number; height: number}

class GraphEditorPoint extends React.PureComponent<IProps, IState> {
  isSelected: boolean
  isNextPointSelected: boolean
  isPrevPointSelected: boolean
  pointClickArea: React.RefObject<SVGRectElement> = React.createRef()
  activeMode: ActiveMode
  svgSize: TSVGSize
  leftHandleNormalizers: {xNormalizer: number; yNormalizer: number}
  rightHandleNormalizers: {xNormalizer: number; yNormalizer: number}

  constructor(props: IProps) {
    super(props)

    this.state = {
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }
    this.svgSize = getSVGSize(props.propGetter)
  }

  render() {
    const {
      color,
      pointTime,
      pointValue,
      pointHandles,
      pointConnected,
      prevPointTime,
      prevPointValue,
      prevPointHandles,
      prevPointConnected,
      nextPointTime,
      nextPointValue,
    } = this.props
    const handles = (prevPointHandles != null
      ? prevPointHandles.slice(2)
      : [0, 0]
    ).concat(pointHandles.slice(0, 2))
    const {isMoving, handlesMove} = this.state

    const renderLeftHandle =
      prevPointValue != null &&
      prevPointValue !== pointValue &&
      prevPointConnected
    const renderRightHandle =
      nextPointValue != null && nextPointValue !== pointValue && pointConnected

    const leftHandle = renderLeftHandle
      ? [
          pointTime +
            (handles[0] + handlesMove[0]) * (prevPointTime! - pointTime),
          pointValue +
            (handles[1] + handlesMove[1]) * (prevPointValue! - pointValue),
        ]
      : []
    const rightHandle = renderRightHandle
      ? [
          pointTime +
            (handles[2] + handlesMove[2]) * (nextPointTime! - pointTime),
          pointValue +
            (handles[3] + handlesMove[3]) * (nextPointValue! - pointValue),
        ]
      : []

    return (
      <>
        {/* <Subscriber channel={PanelActiveModeChannel}>
          {this._setActiveMode}
        </Subscriber>
        <Subscriber channel={SelectedAreaChannel}>
          {this._highlightAsSelected}
        </Subscriber> */}
        <ActiveModeContext.Consumer>
          {this._setActiveMode}
        </ActiveModeContext.Consumer>
        <g>
          {isMoving && this._renderTransformedPoint(this.state.pointMove)}
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
            onDragStart={this.pointDragStartHandler}
            onDrag={this.pointDragHandler}
            onDragEnd={this.changePointPosition}
          >
            <g>
              <Point
                x={pointTime}
                y={pointValue}
                onClick={this.pointClickHandler}
                onContextMenu={this.contextMenuHandler}
                ref={this.pointClickArea}
              />
            </g>
          </DraggableArea>
          {renderLeftHandle && (
            <DraggableArea
              onDragStart={this.leftHandleDragStartHandler}
              onDrag={this.leftHandleDragHandler}
              onDragEnd={this.moveLeftHandle}
            >
              <g>
                <HandleClickArea
                  x={leftHandle[0]}
                  y={leftHandle[1]}
                  move={handlesMove.slice(0, 2) as [number, number]}
                  color={color.darkened}
                  onClick={e => this.handleClickHandler(e, 'left')}
                />
              </g>
            </DraggableArea>
          )}
          {renderRightHandle && (
            <DraggableArea
              onDragStart={this.rightHandleDragStartHandler}
              onDrag={this.rightHandleDragHandler}
              onDragEnd={this.moveRightHandle}
            >
              <g>
                <HandleClickArea
                  x={rightHandle[0]}
                  y={rightHandle[1]}
                  move={handlesMove.slice(-2) as [number, number]}
                  color={color.darkened}
                  onClick={e => this.handleClickHandler(e, 'right')}
                />
              </g>
            </DraggableArea>
          )}
        </g>
        {/* <Subscriber channel={SelectionMoveChannel}>
          {this._handleSelectionMove}
        </Subscriber> */}
      </>
    )
  }

  _renderTransformedPoint(pointMove: IState['pointMove']) {
    const {
      color,
      pointTime,
      pointValue,
      pointHandles,
      pointConnected,
      prevPointTime,
      prevPointValue,
      prevPointHandles,
      prevPointConnected,
      nextPointTime,
      nextPointValue,
    } = this.props
    const {handlesMove} = this.state

    const newTime = pointTime + pointMove[0]
    const newValue = pointValue + pointMove[1]
    const newHandles = pointHandles
      .slice(0, 2)
      .map((handle: number, index: number) => handle + handlesMove[index + 2])
      .concat(pointHandles.slice(2)) as TPointHandles

    const newPrevPointHandles =
      prevPointHandles != null
        ? (prevPointHandles
            .slice(0, 2)
            .concat(
              prevPointHandles
                .slice(2)
                .map(
                  (handle: number, index: number) =>
                    handle + handlesMove[index],
                ),
            ) as TPointHandles)
        : null

    const renderPrevPointConnector =
      prevPointConnected && prevPointTime != null && prevPointValue != null
    return (
      <g fill={color.darkened} stroke={color.darkened}>
        {pointConnected &&
          nextPointValue != null &&
          nextPointTime != null && (
            <BezierConnector
              leftPointTime={newTime}
              leftPointValue={newValue}
              rightPointTime={
                this.isNextPointSelected
                  ? nextPointTime + pointMove[0]
                  : nextPointTime
              }
              rightPointValue={
                this.isNextPointSelected
                  ? nextPointValue + pointMove[1]
                  : nextPointValue
              }
              handles={newHandles}
            />
          )}
        {renderPrevPointConnector && (
          <BezierConnector
            leftPointTime={
              this.isPrevPointSelected
                ? prevPointTime! + pointMove[0]
                : prevPointTime!
            }
            leftPointValue={
              this.isPrevPointSelected
                ? prevPointValue! + pointMove[1]
                : prevPointValue!
            }
            rightPointTime={newTime}
            rightPointValue={newValue}
            handles={newPrevPointHandles!}
          />
        )}
        <PointCircle x={newTime} y={newValue} />
        {renderPrevPointConnector ? (
          this.isPrevPointSelected ? (
            <PointCircle
              x={prevPointTime! + pointMove[0]}
              y={prevPointValue! + pointMove[1]}
            />
          ) : (
            <PointCircle x={prevPointTime!} y={prevPointValue!} />
          )
        ) : null},
      </g>
    )
  }

  private _setActiveMode = (activeMode: ActiveMode) => {
    this.activeMode = activeMode
    if (this.pointClickArea.current == null) return null
    if (activeMode === MODES.d) {
      this.pointClickArea.current.classList.add(pointCss.highlightRedOnHover)
    } else {
      this.pointClickArea.current.classList.remove(pointCss.highlightRedOnHover)
    }
    return null
  }

  _resetState() {
    this.setState(() => ({
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  pointClickHandler = (e: React.MouseEvent<SVGRectElement>) => {
    e.preventDefault()
    e.stopPropagation()
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

  handleClickHandler = (
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

  pointDragStartHandler = () => {
    // addGlobalPointDragRule()
    this.svgSize = getSVGSize(this.props.propGetter)
  }

  pointDragHandler = (dx: number, dy: number, e: MouseEvent) => {
    const {width, height} = this.svgSize
    let x = (dx / width) * 100
    let y = (dy / height) * 100
    if (e.altKey) y = this.state.pointMove[1]
    if (e.shiftKey) x = this.state.pointMove[0]

    const {pointTime, prevPointTime, nextPointTime} = this.props
    const limitLeft = prevPointTime == null ? 0 : prevPointTime
    const limitRight = nextPointTime == null ? 100 : nextPointTime

    const newT = pointTime + x
    if (newT >= limitRight) x = limitRight - pointTime - 100 / width
    if (newT <= limitLeft) x = limitLeft - pointTime + 100 / width

    this.setState(() => ({
      isMoving: true,
      pointMove: [x, y],
    }))
  }

  changePointPosition = (dragHappened: boolean) => {
    // removeGlobalPointDragRule()
    if (!dragHappened) return
    const {pointMove} = this.state
    const originalCoords = {
      time: this.props.originalTime,
      value: this.props.originalValue,
    }
    const change = {
      time: pointMove[0],
      value: pointMove[1],
    }
    this.props.movePointToNewCoords(
      this.props.pointIndex,
      originalCoords,
      change,
    )
    this._resetState()
  }

  leftHandleDragStartHandler = () => {
    // addGlobalPointDragRule()
    const {width, height} = getSVGSize(this.props.propGetter)
    const {pointTime, pointValue, prevPointTime, prevPointValue} = this.props
    this.leftHandleNormalizers = {
      xNormalizer: (prevPointTime! - pointTime) * width,
      yNormalizer: (prevPointValue! - pointValue) * height,
    }
  }

  leftHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.leftHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [
        clampHandleMove(
          this.props.prevPointHandles![2],
          (dx / xNormalizer) * 100,
        ),
        (dy / yNormalizer) * 100,
        0,
        0,
      ],
    }))
  }

  moveLeftHandle = () => {
    const newHandle = this.props
      .prevPointHandles!.slice(2)
      .map(
        (handle, i) => handle + this.state.handlesMove[i],
      ) as TPointSingleHandle
    this.props.moveLeftHandle(this.props.pointIndex, newHandle)
    this._resetState()
  }

  rightHandleDragStartHandler = () => {
    // addGlobalPointDragRule()
    const {width, height} = getSVGSize(this.props.propGetter)
    const {pointTime, pointValue, nextPointTime, nextPointValue} = this.props
    this.rightHandleNormalizers = {
      xNormalizer: (nextPointTime! - pointTime) * width,
      yNormalizer: (nextPointValue! - pointValue) * height,
    }
  }

  rightHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.rightHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [
        0,
        0,
        clampHandleMove(this.props.pointHandles[0], (dx / xNormalizer) * 100),
        (dy / yNormalizer) * 100,
      ],
    }))
  }

  moveRightHandle = () => {
    const newHandle = this.props.pointHandles
      .slice(0, 2)
      .map(
        (handle, i) => handle + this.state.handlesMove[i + 2],
      ) as TPointSingleHandle
    this.props.moveRightHandle(this.props.pointIndex, newHandle)
    this._resetState()
  }

  contextMenuHandler = (e: React.MouseEvent<SVGRectElement>) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.props.showContextMenu({
      left: clientX,
      top: clientY,
      pointIndex: this.props.pointIndex,
    })
  }

  _highlightAsSelected = (
    selectedArea: $FixMe /*: TTransformedSelectedArea*/,
  ) => {
    // TODO: Fix Me
    // const boxIndex = this.props.propGetter('boxIndex')
    const boxIndex = 0
    let shouldUpdateHighlightAsSelectedClass = false
    if (selectedArea[boxIndex] == null) {
      this.isNextPointSelected = false
      this.isPrevPointSelected = false
      if (this.isSelected) {
        this.isSelected = false
        shouldUpdateHighlightAsSelectedClass = true
      }
    } else {
      const {
        pointTime,
        pointValue,
        prevPointTime,
        prevPointValue,
        nextPointTime,
        nextPointValue,
      } = this.props
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
      if (
        prevPointTime != null &&
        prevPointValue != null &&
        left <= prevPointTime &&
        prevPointTime <= right &&
        top <= prevPointValue &&
        prevPointValue <= bottom
      ) {
        this.isPrevPointSelected = true
      } else {
        this.isPrevPointSelected = false
      }
      if (
        nextPointTime != null &&
        nextPointValue != null &&
        left <= nextPointTime &&
        nextPointTime <= right &&
        top <= nextPointValue &&
        nextPointValue <= bottom
      ) {
        this.isNextPointSelected = true
      } else {
        this.isNextPointSelected = false
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
          value: this.props.pointValue,
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

  _handleSelectionMove = ({x, y}: $FixMe /*: TSelectionMove*/) => {
    if (this.isSelected) {
      const {width, height} = getSVGSize(this.props.propGetter)
      return this._renderTransformedPoint([
        (x / width) * 100,
        (y / height) * 100,
      ])
    }
    return null
  }
}

const clampHandleMove = (handleX: number, moveX: number) => {
  let handleMove = moveX
  if (handleMove + handleX > 1) handleMove = 1 - handleX
  if (handleMove + handleX < 0) handleMove = -handleX
  return handleMove
}

const getSVGSize = (propGetter: TPropGetter): TSVGSize => {
  const height = propGetter('itemHeight')
  const width = propGetter('svgWidth')
  return {width, height}
}

export default GraphEditorPoint
