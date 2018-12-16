import UIComponent from '$tl/ui/handy/UIComponent'
import React from 'react'
import {val, coldVal} from '$shared/DataVerse/atom'
import {TDuration, TRange} from '$tl/ui/panels/AllInOnePanel/Right/types'
import createPointerContext from '$shared/utils/react/createPointerContext'
import {IAllInOnePanelStuff} from '$tl/ui/panels/AllInOnePanel/AllInOnePanel'
import uiSelectors from '$tl/ui/store/selectors'
import {
  getSvgWidth,
  xToTime,
  timeToInRangeX,
  deltaTimelineXToDeltaTime,
} from '$tl/ui/panels/AllInOnePanel/Right/utils'
import TimelineInstance from '$tl/timelines/TimelineInstance'
import TimelineTemplate from '$tl/timelines/TimelineTemplate'
import UI from '$tl/ui/UI'
import projectSelectors from '$tl/Project/store/selectors'
import {overshootDuration} from '$tl/ui/panels/AllInOnePanel/TimeUI/utils'
import {viewportScrolledSpace} from './Right/utils'
import {clamp} from 'lodash-es'
import {Pointer} from '$shared/DataVerse/pointer'
import autoDerive from '$shared/DataVerse/derivations/autoDerive/autoDerive'

interface IProps {
  children: React.ReactNode
}

interface IState {}

interface IRangeAndDuration {
  range: TRange
  realDuration: TDuration
  overshotDuration: TDuration
}

export const useAllInOnePanelStuff: () => Pointer<
  IAllInOnePanelStuff
> = null as $IntentionalAny

export const useAutoDerive: (
  extraDeps?: $IntentionalAny[],
) => typeof autoDerive = null as $IntentionalAny

type IStateStuff<S> = {set: (s: S) => void; value: S; getCurrentValue(): S}
type IUseState = <S>(s: () => S) => IStateStuff<S>

const useState: IUseState = null as $IntentionalAny

export const useMemo: <T>(
  fn: () => T,
  vars: $IntentionalAny[],
) => T = null as $IntentionalAny

export interface HOOKED_IRangeAndDurationLock {
  unlock: (() => void)
  relock: (lockedRangeAndDuration: IRangeAndDuration) => void
}

export interface HOOKED_ITimeStuff {
  rangeAndDuration: IRangeAndDuration
  unlockedRangeAndDuration: IRangeAndDuration
  rangeAdndurationAreLocked: boolean
  inRangeSpace: {
    inRangeXToTime: (x: number, shouldClamp?: boolean) => number
    timeToInRangeX: (t: number) => number
    deltaXToDeltaTime: (x: number) => number
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
  ) => HOOKED_IRangeAndDurationLock
  ui: UI
  setRange: (range: TRange) => void
  timeSpace: {
    clamp: (t: number) => number
  }
}

const {Provider, Consumer: HOOKED_TimeStuff} = createPointerContext<
  HOOKED_ITimeStuff
>()

export {HOOKED_TimeStuff}

export default class HOOKED_TimeStuffProvider extends UIComponent<
  IProps,
  IState
> {
  constructor(props: IProps, context: $IntentionalAny) {
    super(props, context)
  }

  hooked_render(props: IProps) {
    const stuffP = useAllInOnePanelStuff()
    return useAutoDerive([stuffP])(() => {
      const timelineTemplate = val(stuffP.timelineTemplate)
      const timelineInstance = val(stuffP.timelineInstance)
      if (!timelineTemplate || !timelineInstance) return null
      const project = val(stuffP.project)!
      const ui = coldVal(stuffP.ui)

      const rangeAndDurationLock = useRangeAndDurationLock()

      const timelineAddress = timelineTemplate.address

      const persistedRange = val(
        uiSelectors.ahistoric.getRangeShownInPanel(
          ui.atomP.ahistoric,
          timelineAddress,
        ),
      )

      const persistedRealDuration = val(
        projectSelectors.historic.getTimelineDuration(
          project.atomP.historic,
          timelineAddress,
        ),
      )

      const unlockedRangeAndDuration = refineRangeAndDuration({
        range: persistedRange,
        realDuration: persistedRealDuration,
      })

      const rangeAndDuration =
        rangeAndDurationLock.isLocked || unlockedRangeAndDuration

      const viewportWidth = val(stuffP.rightWidth)

      const scrollSpaceWidth = getSvgWidth(
        rangeAndDuration.range,
        rangeAndDuration.overshotDuration,
        viewportWidth,
      )

      const setRange = useMemo(
        () => (range: TRange) => {
          ui._dispatch(
            ui.actions.ahistoric.setRangeShownInPanel({
              ...timelineTemplate.address,
              range,
            }),
          )
        },
        [timelineTemplate],
      )

      const timeStuff: HOOKED_ITimeStuff = {
        rangeAndDuration,
        unlockedRangeAndDuration,
        lockRangeAndDuration: rangeAndDurationLock.lock,
        rangeAdndurationAreLocked: !!rangeAndDurationLock.isLocked,
        scrollSpace: {
          width: scrollSpaceWidth,
          xToTime: useMemo(
            () => xToTime(rangeAndDuration.overshotDuration, scrollSpaceWidth),
            [rangeAndDuration.overshotDuration, scrollSpaceWidth],
          ),
        },
        viewportSpace: {
          width: viewportWidth,
          height: val(stuffP.heightMinusBottom),
          clampX: useMemo(
            () => (x: number): number => clamp(x, 0, viewportWidth),
            [viewportWidth],
          ),
        },
        timelineInstance,
        timelineTemplate,
        ui,
        setRange,
        inRangeSpace: {
          deltaXToDeltaTime: useMemo(
            () =>
              deltaTimelineXToDeltaTime(rangeAndDuration.range, viewportWidth),
            [rangeAndDuration.range, viewportWidth],
          ),
          inRangeXToTime: useMemo(
            () =>
              viewportScrolledSpace.xToTime(
                rangeAndDuration.range,
                rangeAndDuration.overshotDuration,
                viewportWidth,
              ),
            [
              rangeAndDuration.range,
              rangeAndDuration.overshotDuration,
              viewportWidth,
            ],
          ),
          timeToInRangeX: useMemo(
            () =>
              timeToInRangeX(
                rangeAndDuration.range,
                rangeAndDuration.overshotDuration,
                viewportWidth,
              ),
            [
              rangeAndDuration.range,
              rangeAndDuration.overshotDuration,
              viewportWidth,
            ],
          ),
        },
        timeSpace: {
          clamp: useMemo(
            () => (t: number): number => clamp(t, 0, persistedRealDuration),
            [persistedRealDuration],
          ),
        },
      }

      return <Provider value={timeStuff}>{props.children}</Provider>
    })
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

const useRangeAndDurationLock = () => {
  const stateHolder = useState<null | IRangeAndDuration>(() => null)
  const isLocked = stateHolder.value

  const unlockRangeAndDuration = () => {
    stateHolder.set(null)
  }

  const lock = useMemo(
    () => (
      lockedRangeAndDuration: IRangeAndDuration,
    ): HOOKED_IRangeAndDurationLock => {
      if (stateHolder.getCurrentValue()) {
        throw new Error(`Range is already locked`)
      }
      stateHolder.set(lockedRangeAndDuration)
      const unlock = () => unlockRangeAndDuration()
      const relock = (lockedRangeAndDuration: IRangeAndDuration) => {
        stateHolder.set(lockedRangeAndDuration)
      }
      return {unlock, relock}
    },
    [],
  )

  return {isLocked, lock}
}
