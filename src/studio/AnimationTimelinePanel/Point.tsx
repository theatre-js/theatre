import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import {PanelActiveModeChannel} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {
  MODE_D,
  MODE_C,
  MODE_H,
  MODE_CMD,
} from '$studio/workspace/components/StudioUI/StudioUI'
import {PointHandles as IHandles} from '$studio/AnimationTimelinePanel/types'
import {SelectionBoundariesChannel} from '$studio/AnimationTimelinePanel/AnimationTimelinePanel'
import {BoxIndexChannel} from '$studio/AnimationTimelinePanel/VariablesBox'

interface IProps {
  color: $FixMe
  prevPointTime?: number
  prevPointValue?: number
  prevPointHandles?: IHandles
  prevPointConnected?: boolean
  nextPointTime?: number
  nextPointValue?: number
  pointTime: number
  pointValue: number
  pointHandles: IHandles
  pointConnected: boolean
  pointAbsoluteTime: number
  pointAbsoluteValue: number
  pointIndex: number
  getSvgSize: Function
  showPointValuesEditor: Function
  showContextMenu: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  removePoint: Function
  addConnector: Function
  makeHandleHorizontal: Function
}

interface IState {
  isMoving: boolean
  pointMove: [number, number]
  handlesMove: IHandles
}

class Point extends React.PureComponent<IProps, IState> {
  isSelected: boolean;
  boxIndex: number
  pointClickRect: SVGRectElement | null
  activeMode: string
  svgSize: {width: number; height: number}
  leftHandleNormalizers: {xNormalizer: number; yNormalizer: number}
  rightHandleNormalizers: {xNormalizer: number; yNormalizer: number}
  valueForm: SingleInputForm
  timeForm: SingleInputForm

  constructor(props: IProps) {
    super(props)

    this.state = {
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }
    this.svgSize = props.getSvgSize()
  }

  _resetState() {
    this.setState(() => ({
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  pointClickHandler = (e: $FixMe) => {
    e.preventDefault()
    e.stopPropagation()
    switch (this.activeMode) {
      case MODE_C:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODE_CMD:
        this.props.addConnector(this.props.pointIndex)
        break
      case MODE_D:
        this.props.removePoint(this.props.pointIndex)
        break
      default: {
        const {left, top, width, height} = e.target.getBoundingClientRect()
        const params = {
          left: left + width / 2,
          top: top + height / 2,
          initialTime: this.props.pointAbsoluteTime,
          initialValue: this.props.pointAbsoluteValue,
        }
        this.props.showPointValuesEditor(this.props.pointIndex, params)
      }
    }
  }

  handleClickHandler = (e: $FixMe, side: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    if (this.activeMode === MODE_H) {
      return this.props.makeHandleHorizontal(this.props.pointIndex, side)
    }
  }

  pointDragStartHandler = () => {
    this._addGlobalCursorRule()
    this.svgSize = this.props.getSvgSize()
  }

  pointDragHandler = (dx: number, dy: number) => {
    const {width, height} = this.svgSize
    let x = dx / width * 100
    // if (e.altKey) y = this.state.pointMove[1]
    // if (e.shiftKey) x = this.state.pointMove[0]

    const {pointTime, prevPointTime, nextPointTime} = this.props
    const limitLeft = prevPointTime == null ? 0 : prevPointTime
    const limitRight = nextPointTime == null ? 100 : nextPointTime

    const newT = pointTime + x
    if (newT >= limitRight) x = limitRight - pointTime - 100 / width
    if (newT <= limitLeft) x = limitLeft - pointTime + 100 / width

    this.setState(() => ({
      isMoving: true,
      pointMove: [x, dy / height * 100],
    }))
  }

  changePointPosition = (dragHappened: boolean) => {
    this._removeGlobalCursorRule()
    if (!dragHappened) return
    const {pointMove} = this.state
    this.props.changePointPositionBy(this.props.pointIndex, {
      time: pointMove[0],
      value: pointMove[1],
    })
    // this._resetState()
  }

  leftHandleDragStartHandler = () => {
    this._addGlobalCursorRule()
    const {width, height} = this.props.getSvgSize()
    const {pointTime, pointValue, prevPointTime, prevPointValue} = this.props
    this.leftHandleNormalizers = {
      // @ts-ignore
      xNormalizer: (prevPointTime - pointTime) * width,
      // @ts-ignore
      yNormalizer: (prevPointValue - pointValue) * height,
    }
  }

  leftHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.leftHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [dx / xNormalizer * 100, dy / yNormalizer * 100, 0, 0],
    }))
  }

  rightHandleDragStartHandler = () => {
    this._addGlobalCursorRule()
    const {width, height} = this.props.getSvgSize()
    const {pointTime, pointValue, nextPointTime, nextPointValue} = this.props
    this.rightHandleNormalizers = {
      // @ts-ignore
      xNormalizer: (nextPointTime - pointTime) * width,
      // @ts-ignore
      yNormalizer: (nextPointValue - pointValue) * height,
    }
  }

  rightHandleDragHandler = (dx: number, dy: number) => {
    const {xNormalizer, yNormalizer} = this.rightHandleNormalizers
    this.setState(() => ({
      isMoving: true,
      handlesMove: [0, 0, dx / xNormalizer * 100, dy / yNormalizer * 100],
    }))
  }

  changePointHandles = () => {
    this._removeGlobalCursorRule()
    const {handlesMove} = this.state
    this.props.changePointHandlesBy(this.props.pointIndex, handlesMove)
    this._resetState()
  }

  _addGlobalCursorRule() {
    document.body.classList.add('pointDrag')
  }

  _removeGlobalCursorRule() {
    document.body.classList.remove('pointDrag')
  }

  contextMenuHandler = (e: $FixMe) => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    const pos = {left: clientX, top: clientY}
    this.props.showContextMenu(this.props.pointIndex, pos)
  }

  _renderTransformedPoint() {
    const {
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
    const {pointMove, handlesMove} = this.state

    const newTime = pointTime + pointMove[0]
    const newValue = pointValue + pointMove[1]
    const newHandles = pointHandles
      .slice(0, 2)
      .map((handle: number, index: number) => handle + handlesMove[index + 2])
      .concat(pointHandles.slice(2)) as IHandles

    // @ts-ignore
    const newPrevPointHandles =
      prevPointHandles != null &&
      (prevPointHandles.slice(0, 2).concat(
        // @ts-ignore
        prevPointHandles
          .slice(2)
          .map((handle: number, index: number) => handle + handlesMove[index]),
      ) as IHandles)

    return (
      <g opacity={0.5}>
        {pointConnected &&
          nextPointValue != null &&
          nextPointTime != null && (
            <Connector
              leftPointTime={newTime}
              leftPointValue={newValue}
              rightPointTime={nextPointTime}
              rightPointValue={nextPointValue}
              handles={newHandles}
            />
          )}
        {prevPointConnected &&
          prevPointTime != null &&
          prevPointValue != null && (
            <Connector
              leftPointTime={prevPointTime}
              leftPointValue={prevPointValue}
              rightPointTime={newTime}
              rightPointValue={newValue}
              handles={newPrevPointHandles}
            />
          )}
        <circle
          fill="#1C2226"
          strokeWidth={2}
          cx={`${newTime}%`}
          cy={`${newValue}%`}
          r={3.2}
        />
      </g>
    )
  }

  _setActiveMode(activeMode: string) {
    this.activeMode = activeMode
    if (this.pointClickRect == null) return
    if (activeMode === MODE_D) {
      this.pointClickRect.classList.add('point-highlightRedOnHover')
    } else {
      this.pointClickRect.classList.remove('point-highlightRedOnHover')
    }
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

    const x = `${pointTime}%`
    const y = `${pointValue}%`
    const leftHandle = renderLeftHandle && [
      `${pointTime +
        // @ts-ignore
        (handles[0] + handlesMove[0]) * (prevPointTime - pointTime)}%`,
      `${pointValue +
        // @ts-ignore
        (handles[1] + handlesMove[1]) * (prevPointValue - pointValue)}%`,
    ]
    const rightHandle = renderRightHandle && [
      `${pointTime +
        // @ts-ignore
        (handles[2] + handlesMove[2]) * (nextPointTime - pointTime)}%`,
      `${pointValue +
        // @ts-ignore
        (handles[3] + handlesMove[3]) * (nextPointValue - pointValue)}%`,
    ]

    return [
      <Subscriber key="activeModeSubscriber" channel={PanelActiveModeChannel}>
        {({activeMode}: {activeMode: string}) => {
          this._setActiveMode(activeMode)
          return null
        }}
      </Subscriber>,
      <Subscriber
        key="selectionBoundariesSubscriber"
        channel={SelectionBoundariesChannel}
      >
        {(value: undefined | null | Object) => {
          if (value == null) {
            if (this.isSelected) {
              this.isSelected = false
              this.pointClickRect.classList.remove('point-highlightAsSelected')
            }
            return null
          }
          if (value.boxesInSelection.includes(String(this.boxIndex))) {
            const {left, top, right, bottom} = value.selectionBoundaries[
              this.boxIndex
            ]
            if (
              left <= pointTime &&
              pointTime <= right &&
              top <= pointValue &&
              pointValue <= bottom
            ) {
              if (!this.isSelected) {
                this.isSelected = true
                this.pointClickRect.classList.add('point-highlightAsSelected')
              }
            } else {
              if (this.isSelected) {
                this.isSelected = false
                this.pointClickRect.classList.remove('point-highlightAsSelected')
              }
            }
          } else {
            if (this.isSelected) {
              this.isSelected = false
              this.pointClickRect.classList.remove('point-highlightAsSelected')
            }
          }
          return null
        }}
      </Subscriber>,
      <Subscriber key="boxIndexSubscriber" channel={BoxIndexChannel}>
        {(boxIndex: number) => {
          this.boxIndex = boxIndex
          return null
        }}
      </Subscriber>,
      <g key="point">
        {isMoving && this._renderTransformedPoint()}
        {renderLeftHandle && (
          <line
            x1={x}
            y1={y}
            // @ts-ignore
            x2={leftHandle[0]}
            // @ts-ignore
            y2={leftHandle[1]}
            fill={color.darkened}
            stroke={color.darkened}
          />
        )}
        {renderRightHandle && (
          <g>
            <line
              x1={x}
              y1={y}
              // @ts-ignore
              x2={rightHandle[0]}
              // @ts-ignore
              y2={rightHandle[1]}
              fill={color.darkened}
              stroke={color.darkened}
            />
          </g>
        )}
        <DraggableArea
          onDragStart={this.pointDragStartHandler}
          onDrag={this.pointDragHandler}
          onDragEnd={this.changePointPosition}
        >
          <g>
            <rect
              width="16"
              height="16"
              x={x}
              y={y}
              fill="transparent"
              stroke="transparent"
              transform={`translate(-8 -8)`}
              onContextMenu={this.contextMenuHandler}
              onClick={this.pointClickHandler}
              className={css.pointClickRect}
              ref={c => (this.pointClickRect = c)}
            />
            <circle cx={x} cy={y} r={6} className={css.pointGlow} />
            <circle
              strokeWidth="2"
              cx={x}
              cy={y}
              r={3.2}
              className={css.pointStroke}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              fill="#1C2226"
              stroke="transparent"
              cx={x}
              cy={y}
              r={2.4}
              className={css.pointCenter}
            />
          </g>
        </DraggableArea>
        {renderLeftHandle && (
          <DraggableArea
            onDragStart={this.leftHandleDragStartHandler}
            onDrag={this.leftHandleDragHandler}
            onDragEnd={this.changePointHandles}
          >
            <g>
              <rect
                width="12"
                height="12"
                // @ts-ignore
                x={leftHandle[0]}
                // @ts-ignore
                y={leftHandle[1]}
                fill="transparent"
                stroke="transparent"
                transform={`translate(${handlesMove[0] - 6} ${handlesMove[1] -
                  6})`}
                onClick={e => this.handleClickHandler(e, 'left')}
                className={css.handleClickRect}
              />
              <circle
                strokeWidth="1"
                // @ts-ignore
                cx={leftHandle[0]}
                // @ts-ignore
                cy={leftHandle[1]}
                r={2}
                className={css.handle}
                stroke={color.darkened}
                fill={color.darkened}
              />
            </g>
          </DraggableArea>
        )}
        {renderRightHandle && (
          <DraggableArea
            onDragStart={this.rightHandleDragStartHandler}
            onDrag={this.rightHandleDragHandler}
            onDragEnd={this.changePointHandles}
          >
            <g>
              <rect
                width="12"
                height="12"
                // @ts-ignore
                x={rightHandle[0]}
                // @ts-ignore
                y={rightHandle[1]}
                fill="transparent"
                stroke="transparent"
                onClick={e => this.handleClickHandler(e, 'right')}
                transform={`translate(${handlesMove[2] - 6} ${handlesMove[3] -
                  6})`}
                className={css.handleClickRect}
              />
              <circle
                strokeWidth="1"
                // @ts-ignore
                cx={rightHandle[0]}
                // @ts-ignore
                cy={rightHandle[1]}
                r={2}
                className={css.handle}
                stroke={color.darkened}
                fill={color.darkened}
              />
            </g>
          </DraggableArea>
        )}
      </g>,
    ]
  }
}

export default Point
