import React from 'react'
import css from './FocusSelector.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  timeToX,
  xToTime,
  getRangeLabel,
  timeToTimelineX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewRange} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import {SVG_PADDING_X} from '$tl/ui/panels/AllInOnePanel/Right/views/SVGWrapper'

const classes = resolveCss(css)

interface IProps {
  duration: TDuration
  range: TRange
  timelineWidth: number
  setRange: (range: TRange) => void
}

interface IState {}

class FocusSelector extends React.PureComponent<IProps, IState> {
  _propsBeforeMove: IProps = this.props
  render() {
    const {range: _range, duration, timelineWidth} = this.props
    // const range = {from: _range.from, to: _range.from + (_range.to - _range.from) / 2}
    const range = {from: 0, to: 2000}
    const tToX = timeToTimelineX(_range, timelineWidth - SVG_PADDING_X)
    const getLabel = getRangeLabel(range, duration, timelineWidth)
    const rangeFromX = tToX(range.from)
    const rangeToX = tToX(range.to)

    return (
      <div {...classes('container')}>
        <div {...classes('timeThread')}>
          <DraggableArea
            onDragStart={this._recordPropsBeforeMove}
            onDrag={this.updateRange}
            lockCursorTo="ew-resize"
          >
            <div
              {...classes('rangeBar')}
              style={{
                width: `${rangeToX - rangeFromX}px`,
                transform: `translate3d(${rangeFromX}px, 0, 0)`,
              }}
            />
          </DraggableArea>
          <DraggableArea
            onDrag={this.updateRangeFrom}
            lockCursorTo="w-resize"
            onDragStart={this._recordPropsBeforeMove}
          >
            <div
              {...classes('rangeFromHandle')}
              style={{transform: `translate3d(${rangeFromX}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{getLabel(range.from)}</div>
            </div>
          </DraggableArea>
          <DraggableArea
            onDrag={this.updateRangeTo}
            lockCursorTo="e-resize"
            onDragStart={this._recordPropsBeforeMove}
          >
            <div
              {...classes('rangeToHandle')}
              style={{transform: `translate3d(${rangeToX}px, 0, 0)`}}
            >
              <div {...classes('tooltip')}>{getLabel(range.to)}</div>
            </div>
          </DraggableArea>
        </div>
      </div>
    )
  }

  _recordPropsBeforeMove = () => {
    this._propsBeforeMove = this.props
  }

  updateRange = (dx: number) => {
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: dt}, true)
  }

  updateRangeFrom = (dx: number) => {
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: 0}, false)
  }

  updateRangeTo = (dx: number) => {
    const {duration, timelineWidth} = this._propsBeforeMove
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: 0, to: dt}, false)
  }

  _setRange(change: TRange, bringRangeToBackIfRangeFromIsSubzero: boolean) {
    const {range, duration, setRange} = this._propsBeforeMove
    setRange(
      getNewRange(
        range,
        change,
        duration,
        bringRangeToBackIfRangeFromIsSubzero,
      ),
    )
  }
}

export default FocusSelector
