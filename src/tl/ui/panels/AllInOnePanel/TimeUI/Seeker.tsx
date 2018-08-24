import React from 'react'
import css from './Seeker.css'
import resolveCss from '$shared/utils/resolveCss'
import {inRangeTimeToX} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import {getNewTime} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import DraggableArea from '$shared/components/DraggableArea/DraggableArea'

const classes = resolveCss(css)

interface IProps {
  width: number
  currentTime: number
  range: TRange
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
          // onDragStart={addGlobalSeekerDragRule}
          onDrag={this.gotoTime}
          // onDragEnd={removeGlobalSeekerDragRule}
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
    const {range, currentTime, width} = this.props
    const newTime = getNewTime(range, currentTime, width, dx)
    this.props.gotoTime(newTime)
  }
}

export default Seeker
