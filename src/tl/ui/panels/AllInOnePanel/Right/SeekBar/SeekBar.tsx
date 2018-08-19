import resolveCss from '$shared/utils/resolveCss'
import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import * as css from './SeekBar.css'
import {val} from '$shared/DataVerse2/atom'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import Seeker from '$tl/ui/panels/AllInOnePanel/Right/SeekBar/Seeker'

interface IProps {}

interface IState {}
const classes = resolveCss(css)

export default class SeekBar extends UIComponent<IProps, IState> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {allInOnePanelStuffP => {
          return (
            <PropsAsPointer>
              {() => {
                const timelineInstance = val(
                  allInOnePanelStuffP.timelineInstance,
                )
                const internalTimeline = val(
                  allInOnePanelStuffP.internalTimeline,
                )

                // width of the seekbar
                const width = val(allInOnePanelStuffP.rightWidth)
                // height of the seekbar
                const height = val(allInOnePanelStuffP.height)

                if (!internalTimeline || !timelineInstance) return null
                const currentTime = val(timelineInstance.statePointer.time)
                // seeking is done with this:
                // const gotoTime = timelineInstance.gotoTime

                // changing range:
                // internalTimeline._setRangeShownInPanel({from: 0, to: 1000})

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

                const rangeState = val(internalTimeline.pointerToRangeState)
                return (
                  <>
                    {/* <RangeBar
                      width={width}
                      duration={rangeState.duration}
                      range={rangeState.rangeShownInPanel}
                      setRange={internalTimeline._setRangeShownInPanel}
                    /> */}
                    <Seeker
                      width={width}
                      currentTime={currentTime}
                      range={rangeState.rangeShownInPanel}
                      gotoTime={timelineInstance.gotoTime}
                    />
                  </>
                  // <div>
                  //   <div>current time: {currentTime}</div>
                  //   <div>range stuff: {JSON.stringify(rangeState)}</div>
                  //   <div>width: {width}</div>
                  //   <div>height: {height}</div>
                  // </div>
                )
              }}
            </PropsAsPointer>
          )
        }}
      </AllInOnePanelStuff>
    )
  }
}
