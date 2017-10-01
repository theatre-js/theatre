// @flow
import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import DraggableArea from '$studio/common/components/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'
import {type NormalizedPoint, type PointHandles} from '$studio/animationTimeline/types'

type Props = {
  point: NormalizedPoint,
  prevPoint: ?NormalizedPoint,
  nextPoint: ?NormalizedPoint,
  addConnector: Function,
  changePointPositionBy: Function,
  changePointHandlesBy: Function,
  setPointPositionTo: Function,
  removePoint: Function,
  makeHandleHorizontal: Function,
  makeHandlesEqual: Function,
  makeHandlesParallel: Function,
}

type State = {
  isMoving: boolean,
  isEnteringProps: boolean,
  pointMove: [number, number],
  handlesMove: PointHandles,
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
    if (this.state.isEnteringProps) {
      this.disableEnteringProps()
    } else {
      this.enableEnteringProps()
    }
  }

  handleClickHandler = (e: SyntheticMouseEvent<>, side: 'left' | 'right') => {
    e.preventDefault()
    e.stopPropagation()
    if (e.altKey) {
      return this.props.makeHandleHorizontal(side)
    }
    if (e.ctrlKey || e.metaKey) {
      return this.props.makeHandlesParallel(side)
    }
    if (e.shiftKey) {
      return this.props.makeHandlesEqual(side)
    }
  }

  pointDragHandler = (dx: number, dy: number, e: SyntheticMouseEvent<>) => {
    let x = dx, y = dy
    if (e.altKey) y = this.state.pointMove[1]
    if (e.shiftKey) x = this.state.pointMove[0]
    this.setState(() => ({
      isMoving: true,
      isEnteringProps: false,
      pointMove: [x, y],
    }))
  }

  changePointPosition = () => {
    const {pointMove} = this.state
    this.props.changePointPositionBy({t: pointMove[0], value: pointMove[1]})
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
    const {handlesMove} = this.state
    this.props.changePointHandlesBy(handlesMove)
    this._resetState()
  }

  setPointPosition = () => {
    const value = Number(this.valueForm.input.value)
    const t = Number(this.timeForm.input.value)
    this.props.setPointPositionTo({t, value})
    this.disableEnteringProps()
  }

  _renderTransformedPoint() {
    const {point, prevPoint, nextPoint} = this.props
    const {pointMove, handlesMove} = this.state
    const movedPoint = {
      ...point,
      t: point.t + pointMove[0],
      value: point.value + pointMove[1],
      handles: (point.handles.map((handle, index) => (handle + handlesMove[index])): $FlowFixMe)}
    return (
      <g opacity={.5}>
        {point.isConnected && (nextPoint != null) &&
          <Connector leftPoint={movedPoint} rightPoint={nextPoint} />
        }
        {(prevPoint != null) && prevPoint.isConnected &&
          <Connector leftPoint={prevPoint} rightPoint={movedPoint} />
        }
        <circle
          fill='#222'
          strokeWidth={2}
          cx={movedPoint.t} cy={movedPoint.value} r={3}
          className={css.point}/>
      </g>
    )
  }

  _renderInputs() {
    const {point: {t, value, _t, _value}} = this.props
    return (
      <foreignObject>
        <div
          className={css.pointTip}
          style={{
            left: `${t > 25 ? t - 25 : 0}px`,
            top: `${value >= 37 ? value - 37 : value + 5}px`,
          }}>
          <div className={css.pointTipRow}>
            <span className={css.pointTipIcon}>
              {String.fromCharCode(0x25b2)}
            </span>
            <SingleInputForm
              ref={(c) => {if (c != null) this.valueForm = c}}
              className={css.pointTipInput}
              value={String(_value)}
              onCancel={this.disableEnteringProps}
              onSubmit={this.setPointPosition}/>
          </div>
          <div className={css.pointTipRow}>
            <span className={css.pointTipIcon}>
              {String.fromCharCode(0x25ba)}
            </span>
            <SingleInputForm
              autoFocus={false}
              ref={(c) => {if(c != null) this.timeForm = c}}
              className={css.pointTipInput}
              value={String(_t)}
              onCancel={this.disableEnteringProps}
              onSubmit={this.setPointPosition}/>
          </div>
        </div>
      </foreignObject>
    )
  }

  render() {
    const {point: {t, value, handles}, prevPoint, nextPoint} = this.props
    const {isMoving, handlesMove, isEnteringProps} = this.state
    const leftHandle = [t + handles[0] + handlesMove[0], value + handles[1] + handlesMove[1]]
    const rightHandle = [t + handles[2] + handlesMove[2], value + handles[3] + handlesMove[3]]
    return (
      <g>
        {isMoving && this._renderTransformedPoint()}
        {(prevPoint != null) &&
          <g>
            <line
              stroke='dimgrey'
              x1={t} y1={value}
              x2={leftHandle[0]} y2={leftHandle[1]}/>
            <DraggableArea
              onDrag={this.leftHandleDragHandler}
              onDragEnd={this.changePointHandles}>
              <circle
                fill='dimgrey'
                stroke='transparent'
                cx={leftHandle[0]} cy={leftHandle[1]} r={2}
                className={css.handle}
                onClick={(e) => this.handleClickHandler(e, 'left')}/>
            </DraggableArea>
          </g>
        }
        {nextPoint &&
          <g>
            <line
              stroke='dimgrey'
              x1={t} y1={value}
              x2={rightHandle[0]} y2={rightHandle[1]}/>
            <DraggableArea
              onDrag={this.rightHandleDragHandler}
              onDragEnd={this.changePointHandles}>
              <circle
                fill='dimgrey'
                stroke='transparent'
                cx={rightHandle[0]} cy={rightHandle[1]} r={2}
                className={css.handle}
                onClick={(e) => this.handleClickHandler(e, 'right')}/>
            </DraggableArea>    
          </g>
        }
        <DraggableArea
          onDrag={this.pointDragHandler}
          onDragEnd={this.changePointPosition}>
          <circle
            fill='#222'
            strokeWidth={2}
            cx={t} cy={value} r={3}
            className={css.point}
            onClick={this.pointClickHandler}/>
        </DraggableArea>
        {isEnteringProps && this._renderInputs()}
      </g>
    )
  }
}

export default Point