import React from 'react'
import css from './Seeker.css'
import {
  addGlobalSeekerDragRule,
  removeGlobalSeekerDragRule,
  inRangeTimeToX,
  xToInRangeTime,
} from '$theater/AnimationTimelinePanel/utils'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import resolveCss from '$shared/utils/resolveCss'
import {RangeState} from '$tl/timelines/InternalTimeline'

const classes = resolveCss(css)

interface IProps {
  width: number
  currentTime: number
  range: RangeState['rangeShownInPanel']
  gotoTime: (t: number) => void
}

interface IState {}

class Seeker extends React.PureComponent<IProps, IState> {
  render() {
    const {range, width, currentTime} = this.props
    const currentX = inRangeTimeToX(range, width)(currentTime)
    const normalizedTime = currentTime / 1000
    const isVisible = currentX >= 0 && currentX <= width

    return (
      <div
        {...classes('seeker', isVisible && 'visible')}
        style={{transform: `translate3d(${currentX}px, 0, 0)`}}
      >
        <DraggableArea
          onDragStart={addGlobalSeekerDragRule}
          onDrag={this.gotoTime}
          onDragEnd={removeGlobalSeekerDragRule}
          shouldReturnMovement={true}
        >
          <div {...classes('thumb')}>
            <div {...classes('squinch')} />
            <div {...classes('tooltip')}>{normalizedTime.toFixed(1)}</div>
          </div>
        </DraggableArea>
        <div {...classes('rod')} />
      </div>
    )
  }

  gotoTime = (dx: number) => {
    const {range, width, currentTime} = this.props
    const currentTimeX = inRangeTimeToX(range, width)(currentTime)
    const newTime = xToInRangeTime(range, width)(currentTimeX + dx)
    this.props.gotoTime(newTime)
  }
}

export default Seeker
