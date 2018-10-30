import FocusBar from '$studio/AnimationTimelinePanel/time/FocusBar'
import React from 'react'
import Seeker from '$studio/AnimationTimelinePanel/time/Seeker'

interface IProps {
  focus: [number, number]
  duration: number
  currentTime: number
  boxWidth: number
  updateFocus: (focusLeft: number, focusRight: number) => any
  seekTime: (dx: number) => any
}

class TimeUI extends React.PureComponent<IProps, {}> {
  render() {
    const {
      focus,
      duration,
      currentTime,
      boxWidth,
      updateFocus,
      seekTime,
    } = this.props
    return (
      <>
        <FocusBar
          boxWidth={boxWidth}
          duration={duration}
          focus={focus}
          updateFocus={updateFocus}
        />
        <Seeker
          boxWidth={boxWidth}
          currentTime={currentTime}
          focus={focus}
          seekTime={seekTime}
        />
      </>
    )
  }
}

export default TimeUI
