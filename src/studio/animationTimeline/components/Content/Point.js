// @flow
import React from 'react'
import css from './Point.css'
import Connector from './Connector'
import DraggableArea from '$studio/common/components/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'

type Props = {
  point: $FlowFixMe,
  prevPoint: $FlowFixMe,
  nextPoint: $FlowFixMe,
  updatePointProps: Function,
  removePoint: Function,
  addConnector: Function,
  originalT: number,
  originalValue: number,
}

type State = {
  isMoving: boolean,
  isEnteringProps: boolean,
  pointMove: [number, number],
  handlesMove: [number, number, number, number],
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

  disableEnteringProps = () => {
    this.setState(() => ({isEnteringProps: false}))
  }

  enableEnteringProps = () => {
    this.setState(() => ({isEnteringProps: true}))
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

  leftHandleDragHandler = (dx: number, dy: number) => {
    this.setState((state) => {
      const {handlesMove} = state
      return {
        isMoving: true,
        isEnteringProps: false,
        handlesMove: [dx, dy, handlesMove[2], handlesMove[3]],
      }
    })
  }

  rightHandleDragHandler = (dx: number, dy: number) => {
    this.setState((state) => {
      const {handlesMove} = state
      return {
        isMoving: true,
        isEnteringProps: false,
        handlesMove: [handlesMove[0], handlesMove[1], dx, dy],
      }
    })
  }

  updatePointProps = () => {
    const {point} = this.props
    const {pointMove, handlesMove} = this.state
    this.props.updatePointProps({
      ...point,
      t: point.t + pointMove[0],
      value: point.value + pointMove[1],
      handles: point.handles.map((handle, index) => (handle + handlesMove[index]))})
    this.setState(() => ({
      isMoving: false,
      pointMove: [0, 0],
      handlesMove: [0, 0, 0, 0],
    }))
  }

  updatePointTimeAndValue = () => {
    const value = Number(this.valueForm.input.value)
    const t = Number(this.timeForm.input.value)
    this.props.updatePointProps({t, value})
    this.disableEnteringProps()
  }

  _renderTransformedPoint() {
    const {point, prevPoint, nextPoint} = this.props
    const {pointMove, handlesMove} = this.state
    const movedPoint = {
      ...point,
      t: point.t + pointMove[0],
      value: point.value + pointMove[1],
      handles: point.handles.map((handle, index) => (handle + handlesMove[index]))}
    return (
      <g opacity={.5}>
        {point.isConnected && nextPoint &&
          <Connector leftPoint={movedPoint} rightPoint={nextPoint} />
        }
        {prevPoint && prevPoint.isConnected &&
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
    const {point: {t, value}, originalT, originalValue} = this.props
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
              value={String(originalValue)}
              onCancel={this.disableEnteringProps}
              onSubmit={this.updatePointTimeAndValue}/>
          </div>
          <div className={css.pointTipRow}>
            <span className={css.pointTipIcon}>
              {String.fromCharCode(0x25ba)}
            </span>
            <SingleInputForm
              autoFocus={false}
              ref={(c) => {if(c != null) this.timeForm = c}}
              className={css.pointTipInput}
              value={String(originalT)}
              onCancel={this.disableEnteringProps}
              onSubmit={this.updatePointTimeAndValue}/>
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
              onDragEnd={this.updatePointProps}>
              <circle
                fill='dimgrey'
                stroke='transparent'
                cx={leftHandle[0]} cy={leftHandle[1]} r={2}
                className={css.handle}/>
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
              onDragEnd={this.updatePointProps}>
              <circle
                fill='dimgrey'
                stroke='transparent'
                cx={rightHandle[0]} cy={rightHandle[1]} r={2}
                className={css.handle}/>
            </DraggableArea>    
          </g>
        }
        <DraggableArea
          onDrag={this.pointDragHandler}
          onDragEnd={this.updatePointProps}>
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