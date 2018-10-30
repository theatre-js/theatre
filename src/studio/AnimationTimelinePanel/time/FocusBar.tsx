import React from 'react'
import css from './FocusBar.css'
import resolveCss from '$shared/utils/resolveCss'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import {timeToX, xToTime} from '$theater/AnimationTimelinePanel/utils'

interface IProps {
  duration: number
  focus: [number, number]
  boxWidth: number
  updateFocus: (focusLeft: number, focusRight: number) => any
}

interface IState {}

const classes = resolveCss(css)

class FocusBar extends React.PureComponent<IProps, IState> {
  render() {
    const {focus, duration, boxWidth} = this.props
    const focusLeft = timeToX(duration, boxWidth)(focus[0])
    const focusRight = timeToX(duration, boxWidth)(focus[1])
    const normalizedFocus = focus.map(f => f / 1000)

    return (
      <div {...classes('container')}>
        <div {...classes('timeGrid')} />
        <div {...classes('timeThread')}>
          <DraggableArea
            onDragStart={() => this.handleDragStart({left: true, right: true})}
            onDrag={this.moveFocus}
            onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('focusBar')}
              style={{
                width: `${focusRight - focusLeft}px`,
                transform: `translate3d(${focusLeft}px, 0, 0)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            onDragStart={() => this.handleDragStart({left: true})}
            onDrag={this.moveFocusLeft}
            onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('leftFocusHandle')}
              style={{transform: `translate3d(${focusLeft}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{normalizedFocus[0].toFixed(1)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDragStart={() => this.handleDragStart({right: true})}
            onDrag={this.moveFocusRight}
            onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('rightFocusHandle')}
              style={{transform: `translate3d(${focusRight}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{normalizedFocus[1].toFixed(1)}</div>
            </div>
          </DraggableArea>
        </div>
      </div>
    )
  }

  handleDragStart({left, right}: {left?: boolean; right?: boolean}) {
    let cursorText = ''
    if (right) cursorText = cursorText.concat('e')
    if (left) cursorText = cursorText.concat('w')
    this.addGlobalCursorRule(cursorText)
  }

  handleDragEnd = () => {
    this.removeGlobalCursorRule()
  }

  moveFocus = (dx: number) => {
    const {focus, duration, boxWidth, updateFocus} = this.props
    const dt = xToTime(duration, boxWidth)(dx)
    updateFocus(focus[0] + dt, focus[1] + dt)
  }

  moveFocusLeft = (dx: number) => {
    const {focus, duration, boxWidth, updateFocus} = this.props
    const dt = xToTime(duration, boxWidth)(dx)
    updateFocus(focus[0] + dt, focus[1])
  }

  moveFocusRight = (dx: number) => {
    const {focus, duration, boxWidth, updateFocus} = this.props
    const dt = xToTime(duration, boxWidth)(dx)
    updateFocus(focus[0], focus[1] + dt)
  }

  addGlobalCursorRule(cursor: string) {
    document.body.classList.add(
      ...['timeBarDrag', 'timeBarDrag'.concat(cursor.toUpperCase())],
    )
  }

  removeGlobalCursorRule() {
    document.body.classList.remove(
      ...['timeBarDrag', 'timeBarDragE', 'timeBarDragW', 'timeBarDragEW'],
    )
  }
}

export default FocusBar
