// @flow
import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import DraggableArea from '$studio/common/components/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'
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

  pointClickHandler = (e: SyntheticMouseEvent<>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) {
      return this.props.removePoint()
    }
    if (e.ctrlKey || e.metaKey) {
      return this.props.addConnector()
    }
    const {left, top, width, height} = e.target.getBoundingClientRect()

    this.props.showPointValuesEditor({
      left: left + width / 2,
      top: top + height / 2,
      initialTime: this.props.point._t,
      initialValue: this.props.point._value,
    })
    // if (this.state.isEnteringProps) {
    //   this.disableEnteringProps()
    // } else {
    //   this.enableEnteringProps()
    // }
  }

  handleClickHandler = (e: SyntheticMouseEvent<>, side: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) {
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

  changePointPosition = () => {
    this._removeGlobalCursorRule()
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
      (newValue - prevValue) / (point.value - prevValue),
      (newT - nextT) / (point.time - nextT),
      (newValue - nextValue) / (point.value - nextValue),
    ]
    const movedPoint: IPoint = {
      ...(point as any),
      time: newT,
      value: newValue,
      interpolationDescriptor: {
        ...point.interpolationDescriptor,
        handles: point.interpolationDescriptor.handles.map(
          (handle, index) =>
            handleFactors[index] * (handle + handlesMove[index]),
        ),
      },
      // @ts-ignore
    }
    return (
      <g opacity={0.5}>
        {point.interpolationDescriptor.connected &&
          nextPoint != null && (
            <Connector
              leftPoint={movedPoint}
              rightPoint={{
                ...nextPoint,
                interpolationDescriptor: {
                  ...nextPoint.interpolationDescriptor,
                  handles: nextPoint.interpolationDescriptor.handles.map(
                    (handle, index) => handleFactors[index % 2 + 2] * handle,
                  ),
                },
              }}
            />
          )}
        {prevPoint != null &&
          prevPoint.interpolationDescriptor.connected && (
            <Connector
              leftPoint={{
                ...prevPoint,
                interpolationDescriptor: {
                  ...nextPoint.interpolationDescriptor,
                  handles: prevPoint.interpolationDescriptor.handles.map(
                    (handle, index) => handleFactors[index % 2] * handle,
                  ),
                },
              }}
              rightPoint={movedPoint}
            />
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

  _renderInputs() {
    const {point: {time, value, _t, _value}} = this.props
    return (
      <foreignObject>
        <div className={css.pointTipContainer}>
          <div
            className={css.pointTip}
            style={{
              left: `${time > 25 ? time - 25 : 0}px`,
              top: `${value >= 37 ? value - 37 : value + 5}px`,
            }}
          >
            <div className={css.pointTipRow}>
              <span className={css.pointTipIcon}>
                {String.fromCharCode(0x25b2)}
              </span>
              <SingleInputForm
                ref={c => {
                  if (c != null) this.valueForm = c
                }}
                className={css.pointTipInput}
                value={String(_value)}
                onCancel={this.disableEnteringProps}
                onSubmit={this.setPointPosition}
              />
            </div>
            <div className={css.pointTipRow}>
              <span className={css.pointTipIcon}>
                {String.fromCharCode(0x25ba)}
              </span>
              <SingleInputForm
                autoFocus={false}
                ref={c => {
                  if (c != null) this.timeForm = c
                }}
                className={css.pointTipInput}
                value={String(_t)}
                onCancel={this.disableEnteringProps}
                onSubmit={this.setPointPosition}
              />
            </div>
          </div>
        </div>
      </foreignObject>
    )
  }

  _addGlobalCursorRule() {
    document.styleSheets[0].insertRule(
      '* {cursor: move !important;}',
      document.styleSheets[0].cssRules.length,
    )
  }

  _removeGlobalCursorRule() {
    document.styleSheets[0].deleteRule(document.styleSheets[0].cssRules.length - 1)
  }

  render() {
    const {point, prevPoint, nextPoint} = this.props
    const {time, value, interpolationDescriptor} = point
    const {handles} = interpolationDescriptor
    const {isMoving, handlesMove, isEnteringProps} = this.state
    const leftHandle = [
      time + handles[0] + handlesMove[0],
      value + handles[1] + handlesMove[1],
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
      <g>
        {isMoving && this._renderTransformedPoint()}
        {renderLeftHandle && (
          <path strokeWidth="1" d={`M ${time} ${value} L ${leftHandle[0]} ${leftHandle[1]}`}/>
        )}
        {renderRightHandle && (
            <g>
              <line
                x1={time}
                y1={value}
                x2={rightHandle[0]}
                y2={rightHandle[1]}
                // filter="url(#darken)"                
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
              onClick={this.pointClickHandler}
              className={css.pointClickRect}
            />
            <circle
              // fill="#1C2226"
              // strokeWidth={1}
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
              // filter="url(#glow)"
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
                onClick={e => this.handleClickHandler(e, 'left')}
                className={css.handleClickRect}
              />
              <circle
                // fill="dimgrey"
                // stroke="dimgrey"
                strokeWidth="1"                
                cx={leftHandle[0]}
                cy={leftHandle[1]}
                r={2}
                className={css.handle}
                // filter="url(#darken)"                
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
                onClick={e => this.handleClickHandler(e, 'right')}
                className={css.handleClickRect}
              />
              <circle
                // fill="dimgrey"
                // stroke="dimgrey"
                strokeWidth="1"
                cx={rightHandle[0]}
                cy={rightHandle[1]}
                r={2}
                className={css.handle}
                filter={`url(#darken)`}
              />
            </g>
          </DraggableArea>
        }
      </g>
    )
  }
}

export default Point
