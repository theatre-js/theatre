import type {StrictRecord} from '@theatre/core/types/public'
import type {PointableSet} from '@theatre/utils/PointableSet'
import type {StudioSheetItemKey} from '@theatre/core/types/private/studio'
import type {
  BasicKeyframe,
  ProjectId,
  SheetId,
  IRange,
} from '@theatre/core/types/public'

export type KeyframeWithPathToPropFromCommonRoot = {
  pathToProp: (string | number)[]
  keyframe: BasicKeyframe
}

export type StudioAhistoricState = {
  /**
   * undefined means the outline menu is pinned
   */
  pinOutline?: boolean
  /**
   * undefined means the detail panel is pinned
   */
  pinDetails?: boolean
  pinNotifications?: boolean
  visibilityState?: 'everythingIsHidden' | 'everythingIsVisible'
  clipboard?: {
    keyframesWithRelativePaths?: KeyframeWithPathToPropFromCommonRoot[]
    // future clipboard data goes here
  }

  projects: {
    stateByProjectId: StrictRecord<
      ProjectId,
      {
        collapsedItemsInOutline?: StrictRecord<string, boolean>
        stateBySheetId: StrictRecord<
          SheetId,
          {
            sequence?: {
              /**
               * Stores the zoom level and scroll position of the sequence editor panel
               * for this particular sheet.
               */
              clippedSpaceRange?: IRange

              /**
               * @remarks
               * We just added this in 0.4.8. Because of that, we defined this as an optional
               * prop, so that a user upgrading from 0.4.7 where `focusRange` did not exist,
               * would not be shown an error.
               *
               * Basically, as the store's state evolves, it should always be backwards-compatible.
               * In other words, the state of `<0.4.8` should always be valid state for `>=0.4.8`.
               *
               * If that is not feasible, then we should write a migration script.
               */
              focusRange?: {
                enabled: boolean
                range: IRange
              }

              collapsableItems?: PointableSet<
                StudioSheetItemKey,
                {
                  isCollapsed: boolean
                }
              >
            }
          }
        >
      }
    >
  }
}
