import React from 'react'
import css from './Seeker.css'
import {
  focusedTimeToX,
  addGlobalSeekerDragRule,
  removeGlobalSeekerDragRule,
} from '$studio/AnimationTimelinePanel/utils'
import DraggableArea from '$studio/common/components/DraggableArea/DraggableArea'
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
      <div
        {...classes('seeker', isVisible && 'visible')}
        style={{transform: `translate3d(${currentX}px, 0, 0)`}}
      >
        <DraggableArea
          onDragStart={addGlobalSeekerDragRule}
          onDrag={this.props.seekTime}
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
}

export default Seeker
