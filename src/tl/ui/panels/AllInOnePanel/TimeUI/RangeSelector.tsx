import React from 'react'
import css from './RangeSelector.css'
import resolveCss from '$shared/utils/resolveCss'
import {
  timeToX,
  xToTime,
  getRangeLabel,
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

class RangeSelector extends React.PureComponent<IProps, IState> {
  render() {
    const {range, duration, timelineWidth} = this.props
    const tToX = timeToX(duration, timelineWidth - SVG_PADDING_X)
    const getLabel = getRangeLabel(range, duration, timelineWidth)
    const rangeFromX = tToX(range.from)
    const rangeToX = tToX(range.to)

    return (
      <div {...classes('container')}>
        <div {...classes('timeThread')}>
          <DraggableArea onDrag={this.updateRange} shouldReturnMovement={true}>
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
            shouldReturnMovement={true}
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
            shouldReturnMovement={true}
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

  updateRange = (dx: number) => {
    const {duration, timelineWidth} = this.props
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: dt})
  }

  updateRangeFrom = (dx: number) => {
    const {duration, timelineWidth} = this.props
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: dt, to: 0})
  }

  updateRangeTo = (dx: number) => {
    const {duration, timelineWidth} = this.props
    const dt = xToTime(duration, timelineWidth)(dx)
    this._setRange({from: 0, to: dt})
  }

  _setRange(change: TRange) {
    const {range, duration, setRange} = this.props
    setRange(getNewRange(range, change, duration))
  }
}

export default RangeSelector
