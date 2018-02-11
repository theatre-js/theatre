// @flow
import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import cx from 'classnames'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import {
  PanelPropsChannel,
} from '$src/studio/workspace/components/Panel/Panel'
import {Subscriber} from 'react-broadcast'
import {MODE_D, MODE_C, MODE_H, MODE_CMD} from '$studio/workspace/components/StudioUI/StudioUI'
import {
  NormalizedPoint,
  PointHandles,
  Point as IPoint,
} from '$studio/animationTimeline/types'

type Props = {
  point: NormalizedPoint
  prevPoint: undefined | null | NormalizedPoint
  nextPoint: undefined | null | NormalizedPoint
  variableWidth: number
  addConnector: Function
  changePointPositionBy: Function
  changePointHandlesBy: Function
  setPointPositionTo: Function
  removePoint: Function
  makeHandleHorizontal: Function
}

type State = {
  isMoving: boolean
  isEnteringProps: boolean
  pointMove: [number, number]
  handlesMove: PointHandles
}

class Point extends React.PureComponent<Props, State> {
  props: Props
  state: State
  valueForm: SingleInputForm
  timeForm: SingleInputForm

  constructor(props: Props) {
    super(props)

    this.state = {
      isMoving: false,
      isEnteringProps: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }
  }

  _resetState() {
    this.setState(() => ({
      isMoving: false,
      isEnteringProps: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  disableEnteringProps = () => {
    this.setState(() => ({isEnteringProps: false}))
  }

  enableEnteringProps = () => {
    this.setState(() => ({isEnteringProps: true}))
  }

  pointClickHandler = (e: $FixMe, activeMode: string) => {
    e.preventDefault()
    e.stopPropagation()
    switch (activeMode) {
      case MODE_C:
        this.props.addConnector()
        break
      case MODE_CMD:
        this.props.addConnector()
        break
      case MODE_D:
        this.props.removePoint()
        break
      default: {
        const {left, top, width, height} = e.target.getBoundingClientRect()

        this.props.showPointValuesEditor({
          left: left + width / 2,
          top: top + height / 2,
          initialTime: this.props.point._t,
          initialValue: this.props.point._value,
          activeMode,
        })
      }
    }
  }

  handleClickHandler = (e: SyntheticMouseEvent<>, side: 'left' | 'right', activeMode: string) => {
    e.preventDefault()
    e.stopPropagation()
    // console.log(activeMode)
    if (activeMode === MODE_H) {
      return this.props.makeHandleHorizontal(side)
    }
  }

  pointDragHandler = (dx: number, dy: number, e: SyntheticMouseEvent<>) => {
    let x = dx,
      y = dy

    if (e.altKey) y = this.state.pointMove[1]
    if (e.shiftKey) x = this.state.pointMove[0]

    const {point, prevPoint, nextPoint, variableWidth} = this.props
    const limitLeft = prevPoint == null ? 0 : prevPoint.time
    const limitRight = nextPoint == null ? variableWidth : nextPoint.time
    const newT = point.time + x
    if (newT >= limitRight) x = limitRight - point.time - 1
    if (newT <= limitLeft) x = limitLeft - point.time + 1

    this.setState(() => ({
      isMoving: true,
      isEnteringProps: false,
      pointMove: [x, y],
    }))
  }

  changePointPosition = (dragHappened: boolean) => {
    this._removeGlobalCursorRule()
    if (!dragHappened) return
    const {pointMove} = this.state
    this.props.changePointPositionBy({time: pointMove[0], value: pointMove[1]})
    this._resetState()
  }

  leftHandleDragHandler = (dx: number, dy: number) => {
    this.setState(() => ({
      isMoving: true,
      isEnteringProps: false,
      handlesMove: [dx, dy, 0, 0],
    }))
  }

  rightHandleDragHandler = (dx: number, dy: number) => {
    this.setState(() => ({
      isMoving: true,
      isEnteringProps: false,
      handlesMove: [0, 0, dx, dy],
    }))
  }

  changePointHandles = () => {
    this._removeGlobalCursorRule()    
    const {handlesMove} = this.state
    this.props.changePointHandlesBy(handlesMove)
    this._resetState()
  }

  setPointPosition = () => {
    const value = Number(this.valueForm.input.value)
    const time = Number(this.timeForm.input.value)
    this.props.setPointPositionTo({time, value})
    this.disableEnteringProps()
  }

  _renderTransformedPoint() {
    const {point, prevPoint, nextPoint} = this.props
    const {pointMove, handlesMove} = this.state
    const [prevT, prevValue] = prevPoint
      ? [prevPoint.time, prevPoint.value]
      : [0, 0]
    const [nextT, nextValue] = nextPoint
      ? [nextPoint.time, nextPoint.value]
      : [0, 0]
    const newT = point.time + pointMove[0]
    const newValue = point.value + pointMove[1]
    const handleFactors = [
      (newT - prevT) / (point.time - prevT),
      (point.value === prevValue) ? 1 : (newValue - prevValue) / (point.value - prevValue),
      (newT - nextT) / (point.time - nextT),
      (point.value === nextValue) ? 1 : (newValue - nextValue) / (point.value - nextValue),
    ]

    const movedPoint: IPoint = {
      ...(point as any),
      time: newT,
      value: newValue,
      interpolationDescriptor: {
        ...point.interpolationDescriptor,
        handles: point.interpolationDescriptor.handles.slice(0, 2).map(
          (handle, index) => (
            handleFactors[index + 2] * (handle + handlesMove[index + 2])
          )
        ).concat(point.interpolationDescriptor.handles.slice(2).map(
          (handle, index) => (handleFactors[index + 2] * handle)
        ))
      }
    }

    const newPrevPoint = prevPoint != null ? (
      {
        ...(prevPoint as any),
        interpolationDescriptor: {
          ...prevPoint.interpolationDescriptor,
          handles: prevPoint.interpolationDescriptor.handles.slice(0, 2).map(
            (handle, index) => (handleFactors[index] * handle)
          ).concat(
            prevPoint.interpolationDescriptor.handles.slice(2).map((handle, index) => (
              handleFactors[index] * (handle - handlesMove[index])
            ))
          )
        }
      }
    ) : prevPoint
    return (
      <g opacity={0.5}>
        {point.interpolationDescriptor.connected &&
          nextPoint != null && (
            <Connector leftPoint={movedPoint} rightPoint={nextPoint}/>
          )}
        {newPrevPoint != null &&
          newPrevPoint.interpolationDescriptor.connected && (
            <Connector leftPoint={newPrevPoint} rightPoint={movedPoint}/>
          )}
        <circle
          fill="#222"
          strokeWidth={2}
          cx={movedPoint.time}
          cy={movedPoint.value}
          r={3}
          className={css.point}
        />
      </g>
    )
  }

  _addGlobalCursorRule() {
    document.styleSheets[0].insertRule(
      `* {cursor: move !important;}`,
      document.styleSheets[0].cssRules.length,
    )
    document.styleSheets[0].insertRule(
      'div[class^="BoxView_boxLegends_"] {pointer-events: none;}',
      document.styleSheets[0].cssRules.length,
    )
  }

  _removeGlobalCursorRule() {
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
  }

  contextMenuHandler = e => {
    e.stopPropagation()
    e.preventDefault()
    const {clientX, clientY} = e
    this.props.showContextMenu({
      left: clientX,
      top: clientY,
    })
  }

  render() {
    const {point, prevPoint, nextPoint, color} = this.props
    const {time, value, interpolationDescriptor} = point
    const handles = 
      (prevPoint ? prevPoint.interpolationDescriptor.handles.slice(2) : [0, 0])
      .concat(interpolationDescriptor.handles.slice(0, 2))
    // const {handles} = interpolationDescriptor
    const {isMoving, handlesMove, isEnteringProps} = this.state
    
    const leftHandle = [
      time - handles[0] + handlesMove[0],
      value - handles[1] + handlesMove[1],
    ]
    const rightHandle = [
      time + handles[2] + handlesMove[2],
      value + handles[3] + handlesMove[3],
    ]

    const renderLeftHandle = prevPoint != null &&
      prevPoint.interpolationDescriptor.connected
    const renderRightHandle = nextPoint != null &&
      point.interpolationDescriptor.connected
    return (
      <Subscriber channel={PanelPropsChannel}>
      {({activeMode}) => {
        const isInDeleteMode = activeMode === MODE_D
        return (
          <g>
            {isMoving && this._renderTransformedPoint()}
            {renderLeftHandle && (
              <line
                x1={time}
                y1={value}
                x2={leftHandle[0]}
                y2={leftHandle[1]}
                fill={color.darkened}
                stroke={color.darkened}
              />
            )}
            {renderRightHandle && (
                <g>
                  <line
                    x1={time}
                    y1={value}
                    x2={rightHandle[0]}
                    y2={rightHandle[1]}
                    fill={color.darkened}
                    stroke={color.darkened}            
                  />
                </g>
              )}
            <DraggableArea
              onDragStart={this._addGlobalCursorRule}
              onDrag={this.pointDragHandler}
              onDragEnd={this.changePointPosition}
            >
              <g>
                <rect
                  width="16"
                  height="16"
                  x={time - 8}
                  y={value - 8}
                  fill="transparent"
                  stroke="transparent"
                  onContextMenu={this.contextMenuHandler}
                  onClick={(e) => this.pointClickHandler(e, activeMode)}
                  className={cx(css.pointClickRect, {[css.highlightRedOnHover]: isInDeleteMode})}
                />
                <circle
                  cx={time}
                  cy={value}
                  r={6}
                  className={css.pointGlow}
                />
                <circle
                  strokeWidth="2"
                  cx={time}
                  cy={value}
                  r={3.2}
                  className={css.pointStroke}
                  />
                <circle
                  fill="#1C2226"
                  stroke="transparent"
                  cx={time}
                  cy={value}
                  r={2.4}
                  className={css.pointCenter}
                />
              </g>
            </DraggableArea>
            {renderLeftHandle &&
              <DraggableArea             
                onDragStart={this._addGlobalCursorRule}            
                onDrag={this.leftHandleDragHandler}
                onDragEnd={this.changePointHandles}
              >
                <g>
                  <rect
                    width="12"
                    height="12"
                    x={leftHandle[0] - 6}
                    y={leftHandle[1] - 6}
                    fill="transparent"
                    stroke="transparent"
                    onClick={e => this.handleClickHandler(e, 'left', activeMode)}
                    className={css.handleClickRect}
                  />
                  <circle
                    strokeWidth="1"                
                    cx={leftHandle[0]}
                    cy={leftHandle[1]}
                    r={2}
                    className={css.handle}     
                    stroke={color.darkened}
                    fill={color.darkened}
                  />
                </g>
              </DraggableArea>
            }
            {renderRightHandle &&
              <DraggableArea         
                onDragStart={this._addGlobalCursorRule}          
                onDrag={this.rightHandleDragHandler}
                onDragEnd={this.changePointHandles}
              >
                <g>
                  <rect
                    width="12"
                    height="12"
                    x={rightHandle[0] - 6}
                    y={rightHandle[1] - 6}
                    fill="transparent"
                    stroke="transparent"
                    onClick={e => this.handleClickHandler(e, 'right', activeMode)}
                    className={css.handleClickRect}
                  />
                  <circle
                    strokeWidth="1"
                    cx={rightHandle[0]}
                    cy={rightHandle[1]}
                    r={2}
                    className={css.handle}
                    stroke={color.darkened}
                    fill={color.darkened}                
                  />
                </g>
              </DraggableArea>
            }
          </g>
        )
      }}
    </Subscriber>
  )}
}

export default Point
