import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import createPointerContext from '$shared/utils/react/createPointerContext'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import uiSelectors from '$tl/ui/store/selectors'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {getSvgWidth} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import {UIAhistoricState} from '../../store/types/ahistoric'
import {Pointer} from '$shared/DataVerse2/pointer'
import UI from '$tl/ui/UI'

interface IProps {
  children: React.ReactNode
}

interface IState {}

interface ITimeStuff {
  range: TRange
  realDuration: TDuration
  overshotDuration: TDuration
  timelineWidth: number
  viewportWidth: number
  timelineInstance: TimelineInstance
  internalTimeline: InternalTimeline
  ui: UI
  setRange: (range: TRange) => void
}

const {Provider, Consumer: TimeStuff} = createPointerContext<ITimeStuff>()

export {TimeStuff}

export default class TimeStuffProvider extends UIComponent<IProps, IState> {
  internalTimeline: InternalTimeline
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {}
    this.internalTimeline = undefined as $IntentionalAny
  }

  setRange = (range: TRange) => {
    this.ui._dispatch(
      this.ui.actions.ahistoric.setRangeShownInPanel({
        ...this.internalTimeline.address,
        range,
      }),
    )
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer props={this.props}>
            {({props: propsP}) => {
              const internalTimeline = val(stuffP.internalTimeline)
              const timelineInstance = val(stuffP.timelineInstance)

              if (!internalTimeline || !timelineInstance) return null
              this.internalTimeline = internalTimeline

              const timelineAddress = internalTimeline.address

              const range = val(
                uiSelectors.ahistoric.getRangeShownInPanel(
                  this.ui.atomP.ahistoric,
                  timelineAddress,
                ),
              )

              const rangeState = val(internalTimeline.pointerToRangeState)

              const realDuration = rangeState.duration
              const overshotDuration = overshootDuration(realDuration)
              const viewportWidth = val(stuffP.rightWidth)

              const timelineWidth = getSvgWidth(
                range,
                overshotDuration,
                viewportWidth,
              )

              const timeStuff: ITimeStuff = {
                range,
                realDuration,
                overshotDuration,
                timelineWidth,
                viewportWidth,
                timelineInstance,
                internalTimeline,
                ui: this.ui,
                setRange: this.setRange,
              }

              return (
                <Provider value={timeStuff}>{val(propsP.children)}</Provider>
              )
            }}
          </PropsAsPointer>
        )}
      </AllInOnePanelStuff>
    )
  }
}
