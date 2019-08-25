import React from 'react'
import css from './Seeker.css'
import resolveCss from '$shared/utils/resolveCss'
import {timeToInRangeX} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewTime} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {IRange, IDuration} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'
import RoomToClick from '$shared/components/RoomToClick/RoomToClick'
import {millisecsToHumanReadableTimestamp} from '$tl/ui/panels/AllInOnePanel/TimeUI/FramesGrid'

const classes = resolveCss(css)

interface IProps {
  timelineWidth: number
  currentTime: number
  range: IRange
  duration: IDuration
  gotoTime: (t: number) => void
  isSeeking: boolean
}

interface IState {}

export default class Seeker extends React.PureComponent<IProps, IState> {
  timeBeforeSeek: number
  propsBeforeSeek: Readonly<{children?: React.ReactNode}> & Readonly<IProps>
  render() {
    const {range, duration, timelineWidth, currentTime, isSeeking} = this.props
    // const currentX = inRangeTimeToX(range, timelineWidth)(currentTime)
    const currentX = timeToInRangeX(range, duration, timelineWidth)(currentTime)
    const isVisible = currentX >= 0 && currentX <= timelineWidth

    return (
      <div
        {...classes(
          'seeker',
          isVisible && 'visible',
          isSeeking && 'showTooltip',
        )}
        style={{transform: `translate3d(${currentX}px, 0, 0)`}}
      >
        <DraggableArea
          onDrag={this.gotoTime}
          onDragStart={this._onSeekerDragStart}
          lockCursorTo="ew-resize"
        >
          <div {...classes('thumb')}>
            <RoomToClick room={4} />
            <div {...classes('squinch')} />
            <div {...classes('tooltip')}>
              {millisecsToHumanReadableTimestamp(currentTime)}
            </div>
          </div>
        </DraggableArea>
        <div {...classes('rod')} />
      </div>
    )
  }

  _onSeekerDragStart = () => {
    this.propsBeforeSeek = this.props
  }

  gotoTime = (dx: number) => {
    const {range, timelineWidth, currentTime} = this.propsBeforeSeek
    const newTime = getNewTime(range, currentTime, timelineWidth, dx)
    this.props.gotoTime(newTime)
  }
}
