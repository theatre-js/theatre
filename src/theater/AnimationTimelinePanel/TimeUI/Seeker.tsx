import React from 'react'
import css from './Seeker.css'
import {
  focusedTimeToX,
  addGlobalSeekerDragRule,
  removeGlobalSeekerDragRule,
} from '$theater/AnimationTimelinePanel/utils'
import DraggableArea from '$theater/common/components/DraggableArea/DraggableArea'
import resolveCss from '$shared/utils/resolveCss'

const classes = resolveCss(css)

interface IProps {
  focus: [number, number]
  boxWidth: number
  currentTime: number
  seekTime: (dx: number) => any
}

interface IState {}

class Seeker extends React.PureComponent<IProps, IState> {
  render() {
    const {focus, boxWidth, currentTime} = this.props
    const currentX = focusedTimeToX(focus, boxWidth)(currentTime)
    const normalizedTime = currentTime / 1000
    const isVisible = currentX >= 0 && currentX <= boxWidth

    return (
      <DraggableArea
        onDragStart={addGlobalSeekerDragRule}
        onDrag={this.props.seekTime}
        onDragEnd={removeGlobalSeekerDragRule}
        shouldReturnMovement={true}
      >
        <div
          {...classes('seeker', isVisible && 'visible')}
          style={{transform: `translate3d(${currentX}px, 0, 0)`}}
        >
          <div {...classes('thumb')}>
            <div {...classes('squinch')} />
            <div {...classes('tooltip')}>{normalizedTime.toFixed(1)}</div>
          </div>
          <div {...classes('rod')} />
        </div>
      </DraggableArea>
    )
  }
}

export default Seeker
