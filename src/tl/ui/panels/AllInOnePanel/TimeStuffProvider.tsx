import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import createPointerContext from '$shared/utils/react/createPointerContext'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import uiSelectors from '$tl/ui/store/selectors'
import {getSvgWidth, xToTime} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import InternalTimeline from '$tl/timelines/InternalTimeline'
import UI from '$tl/ui/UI'
import projectSelectors from '$tl/Project/store/selectors'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'

interface IProps {
  children: React.ReactNode
}

interface IState {
  lockedRangeAndDuration: null | IRangeAndDuration
}

interface IRangeAndDuration {
  range: TRange
  realDuration: TDuration
  overshotDuration: TDuration
}

export interface IRangeAndDurationLock {
  unlock: (() => void)
  relock: (lockedRangeAndDuration: IRangeAndDuration) => void
}

interface ITimeStuff {
  rangeAndDuration: IRangeAndDuration
  unlockedRangeAndDuration: IRangeAndDuration
  rangeAdndurationAreLocked: boolean
  viewportSpace: {
    width: number
  }
  scrollSpace: {
    width: number
    xToTime: (x: number) => number
  }
  timelineInstance: TimelineInstance
  internalTimeline: InternalTimeline
  lockRangeAndDuration: (
    lockedRangeAndDuration: IRangeAndDuration,
  ) => IRangeAndDurationLock
  ui: UI
  setRange: (range: TRange) => void
}

const {Provider, Consumer: TimeStuff} = createPointerContext<ITimeStuff>()

export {TimeStuff}

export default class TimeStuffProvider extends UIComponent<IProps, IState> {
  internalTimeline: InternalTimeline
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {lockedRangeAndDuration: null}
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

  lockRangeAndDuration = (
    lockedRangeAndDuration: IRangeAndDuration,
  ): IRangeAndDurationLock => {
    if (this.state.lockedRangeAndDuration) {
      throw new Error(`Range is already locked`)
    }
    this.setState(() => ({lockedRangeAndDuration}))
    const unlock = () => this._unlockRange()
    const relock = (lockedRangeAndDuration: IRangeAndDuration) => {
      this.setState(() => ({lockedRangeAndDuration}))
    }
    return {unlock, relock}
  }

  _unlockRange = () => {
    this.setState({lockedRangeAndDuration: null})
  }

  render() {
    return (
      <AllInOnePanelStuff>
        {stuffP => (
          <PropsAsPointer props={this.props} state={this.state}>
            {({props: propsP, state: stateP}) => {
              const internalTimeline = val(stuffP.internalTimeline)
              const timelineInstance = val(stuffP.timelineInstance)

              if (!internalTimeline || !timelineInstance) return null
              this.internalTimeline = internalTimeline

              const lockedRangeAndDuration = val(stateP.lockedRangeAndDuration)

              const timelineAddress = internalTimeline.address

              const persistedRange = val(
                uiSelectors.ahistoric.getRangeShownInPanel(
                  this.ui.atomP.ahistoric,
                  timelineAddress,
                ),
              )

              const persistedRealDuration = val(
                projectSelectors.historic.getTimelineDuration(
                  this.internalProject.atomP.historic,
                  timelineAddress,
                ),
              )

              const unlockedRangeAndDuration = refineRangeAndDuration({
                range: persistedRange,
                realDuration: persistedRealDuration,
              })

              const rangeAndDuration =
                lockedRangeAndDuration || unlockedRangeAndDuration

              const viewportWidth = val(stuffP.rightWidth)

              const scrollSpaceWidth = getSvgWidth(
                rangeAndDuration.range,
                rangeAndDuration.overshotDuration,
                viewportWidth,
              )

              const timeStuff: ITimeStuff = {
                rangeAndDuration,
                unlockedRangeAndDuration,
                lockRangeAndDuration: this.lockRangeAndDuration,
                rangeAdndurationAreLocked: !!lockedRangeAndDuration,
                scrollSpace: {
                  width: scrollSpaceWidth,
                  xToTime: xToTime(
                    rangeAndDuration.overshotDuration,
                    scrollSpaceWidth,
                  ),
                },
                viewportSpace: {
                  width: viewportWidth,
                },
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

const refineRangeAndDuration = (
  original: Pick<IRangeAndDuration, 'range' | 'realDuration'>,
): IRangeAndDuration => {
  let from = original.range.from
  let to = original.range.to
  const realDuration = original.realDuration
  const overshotDuration = overshootDuration(realDuration)

  if (from < 0) from = 0
  if (to > overshotDuration) {
    to = overshotDuration
  }
  if (to < from + 0.05) to = from + 0.05

  return {
    range: {from, to},
    realDuration,
    overshotDuration,
  }
}
