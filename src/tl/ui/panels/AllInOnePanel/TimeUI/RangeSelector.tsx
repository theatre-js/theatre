import React from 'react'
import css from './RangeSelector.css'
import resolveCss from '$shared/utils/resolveCss'
import {timeToX, xToTime} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewRange} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

const classes = resolveCss(css)

interface IProps {
  duration: TDuration
  range: TRange
  width: number
  setRange: (range: TRange) => void
}

interface IState {}

class RangeSelector extends React.PureComponent<IProps, IState> {
  render() {
    const {range, duration, width} = this.props
    const rangeFrom = timeToX(duration, width)(range.from)
    const rangeTo = timeToX(duration, width)(range.to)

    return (
      <div {...classes('container')}>
        <div {...classes('timeGrid')} />
        <div {...classes('timeThread')}>
          <DraggableArea
            // onDragStart={() => this.handleDragStart({left: true, right: true})}
            onDrag={this.updateRange}
            // onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('rangeBar')}
              style={{
                width: `${rangeTo - rangeFrom}px`,
                transform: `translate3d(${rangeFrom}px, 0, 0)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            // onDragStart={() => this.handleDragStart({left: true})}
            onDrag={this.updateRangeFrom}
            // onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('rangeFromHandle')}
              style={{transform: `translate3d(${rangeFrom}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>
                {(range.from / 1000).toFixed(1)}
              </div>
            </div>
          </DraggableArea>
          <DraggableArea
            // onDragStart={() => this.handleDragStart({right: true})}
            onDrag={this.updateRangeTo}
            // onDragEnd={this.handleDragEnd}
            shouldReturnMovement={true}
          >
            <div
              {...classes('rangeToHandle')}
              style={{transform: `translate3d(${rangeTo}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{(range.to / 1000).toFixed(1)}</div>
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

  updateRange = (dx: number) => {
    const {duration, width} = this.props
    const dt = xToTime(duration, width)(dx)
    this._setRange({from: dt, to: dt})
  }

  updateRangeFrom = (dx: number) => {
    const {duration, width} = this.props
    const dt = xToTime(duration, width)(dx)
    this._setRange({from: dt, to: 0})
  }

  updateRangeTo = (dx: number) => {
    const {duration, width} = this.props
    const dt = xToTime(duration, width)(dx)
    this._setRange({from: 0, to: dt})
  }

  _setRange(change: TRange) {
    const {range, duration, setRange} = this.props
    setRange(getNewRange(range, change, duration))
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

export default RangeSelector
