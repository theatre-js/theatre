// @flow
import React from 'react'
import css from './TimeBar.css'
import DraggableArea from '$studio/common/components/DraggableArea'
import SingleInputForm from '$lf/common/components/SingleInputForm'

type Props = {
  duration: number
  currentTime: number
  focus: [number, number]
  panelWidth: number
  changeCurrentTimeTo: Function
  changeFocusTo: Function
  changeFocusRightTo: Function
  changeFocusLeftTo: Function
  changeDuration: Function
  timeToX: Function
  xToTime: Function
  focusedTimeToX: Function
  xToFocusedTime: Function
}

type State = {
  timeBeforeMove: number
  focusBeforeMove: [number, number]
  isChangingDuration: boolean
}

class TimeBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      timeBeforeMove: props.currentTime,
      focusBeforeMove: props.focus,
      isChangingDuration: false,
    }
  }

  changeCurrentTime(dx: number) {
    const {focus, xToFocusedTime, focusedTimeToX} = this.props
    const {timeBeforeMove} = this.state
    const currentTimeX = focusedTimeToX(timeBeforeMove, focus)
    this.props.changeCurrentTimeTo(xToFocusedTime(currentTimeX + dx, focus))
  }

  moveFocus(dx: number) {
    const {focusBeforeMove} = this.state
    const dt = this.props.xToTime(dx)
    this.props.changeFocusTo(focusBeforeMove[0] + dt, focusBeforeMove[1] + dt)
  }

  moveFocusRight(dx: number) {
    const {xToTime, changeFocusRightTo} = this.props
    const {focusBeforeMove} = this.state
    changeFocusRightTo(focusBeforeMove[1] + xToTime(dx))
  }

  moveFocusLeft(dx: number) {
    const {xToTime, changeFocusLeftTo} = this.props
    const {focusBeforeMove} = this.state
    changeFocusLeftTo(focusBeforeMove[0] + xToTime(dx))
  }

  _setBeforeMoveState = () => {
    const {currentTime, focus} = this.props
    this.setState(() => ({
      timeBeforeMove: currentTime,
      focusBeforeMove: focus,
    }))
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
    let {currentTime, focus, duration, timeToX, focusedTimeToX} = this.props
    const focusLeft = timeToX(focus[0])
    const focusRight = timeToX(focus[1])
    const currentX = focusedTimeToX(currentTime, focus)
    currentTime = currentTime / 1000
    focus = focus.map(f => f / 1000)
    duration = duration / 1000
    return (
      <div className={css.container}>
        <div className={css.timeStart}>{0}</div>
        {isChangingDuration ? (
          <SingleInputForm
            className={css.timeEndInput}
            value={String(duration)}
            onSubmit={this.changeDuration}
            onCancel={this.disableChangingDuration}
          />
        ) : (
          <div
            className={css.timeEnd}
            title="Double click to change"
            onDoubleClick={this.enableChangingDuration}
          >
            {duration.toFixed(0)}
          </div>
        )}
        <div className={css.timeThread}>
          <DraggableArea
            onDragStart={this._setBeforeMoveState}
            onDrag={dx => this.moveFocus(dx)}
          >
            <div
              className={css.focusBar}
              style={{
                width: `${focusRight - focusLeft}px`,
                transform: `translateX(${focusLeft}px)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            onDragStart={this._setBeforeMoveState}
            onDrag={dx => this.moveFocusLeft(dx)}
          >
            <div
              className={css.leftFocusHandle}
              style={{transform: `translateX(${focusLeft}px)`}}
            >
              <div className={css.timeTip}>{focus[0].toFixed(1)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDragStart={this._setBeforeMoveState}
            onDrag={dx => this.moveFocusRight(dx)}
          >
            <div
              className={css.rightFocusHandle}
              style={{transform: `translateX(${focusRight}px)`}}
            >
              <div className={css.timeTip}>{focus[1].toFixed(1)}</div>
            </div>
          </DraggableArea>
        </div>
        <DraggableArea
          onDragStart={this._setBeforeMoveState}
          onDrag={dx => this.changeCurrentTime(dx)}
        >
          <div
            className={css.currentTime}
            style={{transform: `translateX(${currentX}px)`}}
          >
            <div className={css.timeTip}>{currentTime.toFixed(1)}</div>
          </div>
        </DraggableArea>
      </div>
    )
  }
}

export default TimeBar
