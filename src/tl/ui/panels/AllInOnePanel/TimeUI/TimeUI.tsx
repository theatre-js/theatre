import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from '$tl/ui/panels/AllInOnePanel/TimeUI/TimeUI.css'
import {val} from '$shared/DataVerse2/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import Seeker from '$tl/ui/panels/AllInOnePanel/TimeUI/Seeker'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import RangeSelector from '$tl/ui/panels/AllInOnePanel/TimeUI/RangeSelector'
import FramesGrid from '$tl/ui/panels/AllInOnePanel/TimeUI/FramesGrid'
import clamp from '$shared/number/clamp'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'

interface IProps {
  internalTimeline: InternalTimeline
  timelineInstance: TimelineInstance
  height: number
  timelineWidth: number
  left: number
}

interface IState {}
const classes = resolveCss(css)

export default class TimeUI extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <PropsAsPointer props={this.props}>
        {({props: propsP}) => {
          const internalTimeline = val(propsP.internalTimeline)
          const timelineInstance = val(propsP.timelineInstance)
          if (!internalTimeline || !timelineInstance) return null

          // settingTemporarilyPlayableRange
          // internalTimeline._setTemporarilyLimitedPlayRange({from: 100, to: 500})
          // remove temp play
          // internalTimeline._setTemporarilyLimitedPlayRange(null)
          /**
           * Temporarily playable range is useful when the animator wants to only
           * play a specific range within the timeline. Like, if the timeline is
           * 10 seocnds long, she might want to only work on seconds 2 through 4.
           * For that, we'd call: internalTimeline._setTemporarilyLimitedPlayRange({from: 2000, to: 4000})
           * This would make sure that when the time reaches 4s, it'd jump back to 2s and restart from there.
           * We just need to somehow show this in the timeline
           */
          const currentTime = val(timelineInstance.statePointer.time)
          const rangeState = val(internalTimeline.pointerToRangeState)
          const range = rangeState.rangeShownInPanel
          const height = val(propsP.height)
          const timelineWidth = val(propsP.timelineWidth)
          const left = val(propsP.left)
          const actualDuration = rangeState.duration
          const overshotDuration = overshootDuration(actualDuration)

          function gotoTime(time: number) {
            timelineInstance.time = clamp(time, 0, overshotDuration)
          }

          return (
            <div
              {...classes('container')}
              style={{width: timelineWidth, left, height}}
            >
              <FramesGrid
                range={range}
                duration={overshotDuration}
                timelineWidth={timelineWidth}
              />
              <RangeSelector
                range={range}
                duration={overshotDuration}
                timelineWidth={timelineWidth}
                setRange={internalTimeline._setRangeShownInPanel}
              />
              <Seeker
                range={range}
                duration={overshotDuration}
                timelineWidth={timelineWidth}
                currentTime={currentTime}
                gotoTime={gotoTime}
              />
            </div>
          )
        }}
      </PropsAsPointer>
    )
  }
}
