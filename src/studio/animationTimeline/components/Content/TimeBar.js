// @flow
import React from 'react'
import css from './TimeBar.css'
import DraggableArea from '$studio/common/components/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'

type Props = {
  duration: number,
  currentTime: number,
  focus: [number, number],
  panelWidth: number,
  changeCurrentTimeTo: Function,
  changeFocusTo: Function,
  changeDuration: Function,
}

type State = {
  timeBeforeMove: number,
  focusBeforeMove: [number, number],
  isChangingDuration: boolean,
}

class TimeBar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      timeBeforeMove: props.currentTime,
      focusBeforeMove: props.focus,
      isChangingDuration: false,
    }
  }

  changeCurrentTime(dx: number) {
    const {panelWidth, focus} = this.props
    const {timeBeforeMove} = this.state
    const currentTime = this._focusedTimeToX(timeBeforeMove, focus)
    let x = currentTime + dx
    if (x < 0) x = 0
    if (x > panelWidth) x = panelWidth
    this.props.changeCurrentTimeTo(this._xToFocusedTime(x, focus))
  }

  moveFocus(dx: number) {
    const {panelWidth} = this.props
    const {focusBeforeMove} = this.state
    const dt = this._xToTime(dx)
    const panelTime = this._xToTime(panelWidth)
    const newFocusLeft = focusBeforeMove[0] + dt
    const newFocusRight = focusBeforeMove[1] + dt
    const focusDuration = focusBeforeMove[1] - focusBeforeMove[0]
    let newFocus = [newFocusLeft, newFocusRight]
    if (newFocusLeft < 0) newFocus = [0, focusDuration]
    if (newFocusRight > panelTime) newFocus = [panelTime - focusDuration, panelTime]
    this.changeFocus(newFocus)
  }

  moveFocusRight(dx: number) {
    const {focus, panelWidth} = this.props
    const {focusBeforeMove} = this.state
    const panelTime = this._xToTime(panelWidth)
    let newFocusRight = focusBeforeMove[1] + this._xToTime(dx)
    if (newFocusRight - focus[0] < 1) newFocusRight = focus[0] + 1
    if (newFocusRight > panelTime) newFocusRight = panelTime 
    this.changeFocus([focus[0], newFocusRight])
  }

  moveFocusLeft(dx: number) {
    const {focus} = this.props
    const {focusBeforeMove} = this.state
    let newFocusLeft = focusBeforeMove[0] + this._xToTime(dx)
    if (focus[1] - newFocusLeft < 1) newFocusLeft = focus[1] - 1
    if (this._timeToX(newFocusLeft) < 0) newFocusLeft = 0 
    this.changeFocus([newFocusLeft, focus[1]])
  }

  changeFocus(newFocus: [number, number]) {
    const {timeBeforeMove, focusBeforeMove} = this.state
    const newTime = this._focusedTimeToX(timeBeforeMove, focusBeforeMove)
    this.props.changeFocusTo(newFocus)
    this.props.changeCurrentTimeTo(this._xToFocusedTime(newTime, newFocus))
  }

  _setBeforeMoveState = () => {
    const {currentTime, focus} = this.props
    this.setState(() => ({
      timeBeforeMove: currentTime,
      focusBeforeMove: focus,
    }))
  }

  _timeToX(t: number) {
    const {panelWidth, duration} = this.props
    return t * panelWidth / duration
  }

  _xToTime(x: number) {
    const {panelWidth, duration} = this.props
    return x * duration / panelWidth
  }

  _focusedTimeToX(t: number, focus: [number, number]) {
    const {panelWidth} = this.props
    return (t - focus[0]) / (focus[1] - focus[0]) * panelWidth
  }

  _xToFocusedTime(x: number, focus: [number, number]) {
    const {panelWidth} = this.props
    return x * (focus[1] - focus[0]) / panelWidth + focus[0]
  }

  enableChangingDuration = () => {
    this.setState(() => ({isChangingDuration: true}))
  }

  disableChangingDuration = () => {
    this.setState(() => ({isChangingDuration: false}))
  }

  changeDuration = (newDuration: string) => {
    this.props.changeDuration(Number(newDuration) * 1000)
    this.disableChangingDuration()
  }

  render() {
    const {isChangingDuration} = this.state
    let {currentTime, focus, duration} = this.props
    const focusLeft = this._timeToX(focus[0])
    const focusRight = this._timeToX(focus[1])
    const currentX = this._focusedTimeToX(currentTime, focus)
    currentTime = currentTime / 1000
    focus = focus.map((f) => (f / 1000))
    duration = duration / 1000
    return (
      <div className={css.container}>
        <div className={css.timeStart}>{0}</div>
        {isChangingDuration
          ?
          <SingleInputForm
            className={css.timeEndInput}
            value={String(duration)}
            onSubmit={this.changeDuration}
            onCancel={this.disableChangingDuration} />
          :
          <div className={css.timeEnd} title='Double click to change' onDoubleClick={this.enableChangingDuration}>
            {duration.toFixed(0)}
          </div>
        }
        <div className={css.timeThread}>
          <DraggableArea 
            onDragStart={this._setBeforeMoveState}
            onDrag={(dx) => this.moveFocus(dx)}>
            <div className={css.focusBar} style={{width: `${focusRight - focusLeft}px`, transform: `translateX(${focusLeft}px)`}}/>
          </DraggableArea>
          <DraggableArea
            onDragStart={this._setBeforeMoveState}
            onDrag={(dx) => this.moveFocusLeft(dx)}>
            <div className={css.leftFocusHandle} style={{transform: `translateX(${focusLeft}px)`}}>
              <div className={css.timeTip}>{focus[0].toFixed(1)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDragStart={this._setBeforeMoveState}
            onDrag={(dx) => this.moveFocusRight(dx)}>
            <div className={css.rightFocusHandle} style={{transform: `translateX(${focusRight}px)`}}>
              <div className={css.timeTip}>{focus[1].toFixed(1)}</div>
            </div>  
          </DraggableArea>
        </div>
        <DraggableArea
          onDragStart={this._setBeforeMoveState}
          onDrag={(dx) => this.changeCurrentTime(dx)}>
          <div className={css.currentTime} style={{transform: `translateX(${currentX}px)`}}>
            <div className={css.timeTip}>{currentTime.toFixed(1)}</div>
          </div>
        </DraggableArea>
      </div>
    )
  }
}

export default TimeBar