import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from '$tl/ui/panels/AllInOnePanel/TimeUI/TimeUI.css'
import {val} from '$shared/DataVerse/atom'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import Seeker from '$tl/ui/panels/AllInOnePanel/TimeUI/Seeker'
import TimelineInstance from '$tl/timelines/TimelineInstance/TimelineInstance'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import TimeScrollbar from '$tl/ui/panels/AllInOnePanel/TimeUI/TimeScrollbar'
import FramesGrid from '$tl/ui/panels/AllInOnePanel/TimeUI/FramesGrid'
import clamp from '$shared/number/clamp'
import {TimeStuff} from '$tl/ui/panels/AllInOnePanel/TimeStuffProvider'
import PlaybackRange from './PlaybackRange/PlaybackRange'

interface IProps {
  timelineTemplate: TimelineTemplate
  timelineInstance: TimelineInstance
  height: number
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
      <TimeStuff>
        {timeStuffP => (
          <PropsAsPointer props={this.props}>
            {({props: propsP}) => {
              const timelineTemplate = val(propsP.timelineTemplate)
              const timelineInstance = val(propsP.timelineInstance)
              if (!timelineTemplate || !timelineInstance) return null

              // settingTemporarilyPlayableRange
              // timelineTemplate._setTemporarilyLimitedPlayRange({from: 100, to: 500})
              // remove temp play
              // timelineTemplate._setTemporarilyLimitedPlayRange(null)
              /**
               * Temporarily playable range is useful when the animator wants to only
               * play a specific range within the timeline. Like, if the timeline is
               * 10 seocnds long, she might want to only work on seconds 2 through 4.
               * For that, we'd call: timelineTemplate._setTemporarilyLimitedPlayRange({from: 2000, to: 4000})
               * This would make sure that when the time reaches 4s, it'd jump back to 2s and restart from there.
               * We just need to somehow show this in the timeline
               */
              const currentTime = val(timelineInstance.timeDerivation)

              const range = val(timeStuffP.rangeAndDuration.range)
              // const range = {from: 0, to: 2000}
              const height = val(propsP.height)
              const viewportWidth = val(timeStuffP.viewportSpace.width)
              const left = val(propsP.left)

              const isSeeking = val(timeStuffP.isSeeking)

              const realDuration = val(timeStuffP.rangeAndDuration.realDuration)

              const overshotDuration = val(
                timeStuffP.rangeAndDuration.overshotDuration,
              )

              function gotoTime(time: number) {
                timelineInstance.time = clamp(time, 0, realDuration)
              }

              return (
                <div
                  {...classes('container')}
                  style={{width: viewportWidth, left, height}}
                >
                  <FramesGrid
                    range={range}
                    duration={overshotDuration}
                    timelineWidth={viewportWidth}
                  />
                  <TimeScrollbar
                  /*
                    range={range}
                    duration={overshotDuration}
                    timelineWidth={viewportWidth}
                    setRange={val(timeStuffP.setRange)}
                    */
                  />
                  <Seeker
                    range={range}
                    duration={overshotDuration}
                    timelineWidth={viewportWidth}
                    currentTime={currentTime}
                    gotoTime={gotoTime}
                    isSeeking={isSeeking}
                  />
                  <PlaybackRange />
                </div>
              )
            }}
          </PropsAsPointer>
        )}
      </TimeStuff>
    )
  }
}
