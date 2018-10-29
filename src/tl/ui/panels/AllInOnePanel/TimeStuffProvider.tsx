import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {val} from '$shared/DataVerse2/atom'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import createPointerContext from '$shared/utils/react/createPointerContext'
import {AllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import PropsAsPointer from '$shared/utils/react/PropsAsPointer'
import uiSelectors from '$tl/ui/store/selectors'
import {
  getSvgWidth,
  xToTime,
  timeToInRangeX,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import UI from '$tl/ui/UI'
import projectSelectors from '$tl/Project/store/selectors'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {inRangeXToTime} from './Right/utils'
import {clamp} from 'lodash-es'

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

export interface ITimeStuff {
  rangeAndDuration: IRangeAndDuration
  unlockedRangeAndDuration: IRangeAndDuration
  rangeAdndurationAreLocked: boolean
  inRangeSpace: {
    inRangeXToTime: (x: number, shouldClamp?: boolean) => number
    timeToInRangeX: (t: number) => number
  }
  viewportSpace: {
    width: number
    height: number
    clampX: (x: number) => number
  }
  scrollSpace: {
    width: number
    xToTime: (x: number) => number
  }
  timelineInstance: TimelineInstance
  timelineTemplate: TimelineTemplate
  lockRangeAndDuration: (
    lockedRangeAndDuration: IRangeAndDuration,
  ) => IRangeAndDurationLock
  ui: UI
  setRange: (range: TRange) => void
  timeSpace: {
    clamp: (t: number) => number
  }
}

const {Provider, Consumer: TimeStuff} = createPointerContext<ITimeStuff>()

export {TimeStuff}

export default class TimeStuffProvider extends UIComponent<IProps, IState> {
  timelineTemplate: TimelineTemplate
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
    this.state = {lockedRangeAndDuration: null}
    this.timelineTemplate = undefined as $IntentionalAny
  }

  setRange = (range: TRange) => {
    this.ui._dispatch(
      this.ui.actions.ahistoric.setRangeShownInPanel({
        ...this.timelineTemplate.address,
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
              const timelineTemplate = val(stuffP.timelineTemplate)
              const timelineInstance = val(stuffP.timelineInstance)

              if (!timelineTemplate || !timelineInstance) return null
              this.timelineTemplate = timelineTemplate

              const lockedRangeAndDuration = val(stateP.lockedRangeAndDuration)

              const timelineAddress = timelineTemplate.address

              const persistedRange = val(
                uiSelectors.ahistoric.getRangeShownInPanel(
                  this.ui.atomP.ahistoric,
                  timelineAddress,
                ),
              )

              const persistedRealDuration = val(
                projectSelectors.historic.getTimelineDuration(
                  this.project.atomP.historic,
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
                  height: val(stuffP.heightMinusBottom),
                  clampX: (x: number): number => clamp(x, 0, viewportWidth),
                },
                timelineInstance,
                timelineTemplate,
                ui: this.ui,
                setRange: this.setRange,
                inRangeSpace: {
                  inRangeXToTime: inRangeXToTime(
                    rangeAndDuration.range,
                    rangeAndDuration.overshotDuration,
                    viewportWidth,
                  ),
                  timeToInRangeX: timeToInRangeX(
                    rangeAndDuration.range,
                    rangeAndDuration.overshotDuration,
                    viewportWidth,
                  ),
                },
                timeSpace: {
                  clamp: (t: number): number =>
                    clamp(t, 0, persistedRealDuration),
                },
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
