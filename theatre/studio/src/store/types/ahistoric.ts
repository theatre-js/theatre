import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {ProjectId, SheetId} from '@theatre/shared/utils/ids'
import type {IRange, StrictRecord} from '@theatre/shared/utils/types'
import type {PointableSet} from '@theatre/shared/utils/PointableSet'
import type {StudioSheetItemKey} from '@theatre/shared/utils/ids'

export type UpdateCheckerResponse =
  | {hasUpdates: true; newVersion: string; releasePage: string}
  | {hasUpdates: false}

export type StudioAhistoricState = {
  /**
   * undefined means the outline menu is pinned
   */
  pinOutline?: boolean
  /**
   * undefined means the detail panel is pinned
   */
  pinDetails?: boolean
  visibilityState: 'everythingIsHidden' | 'everythingIsVisible'
  clipboard?: {
    keyframes?: Keyframe[]
    // future clipboard data goes here
  }
  theTrigger: {
    position: {
      closestCorner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
      distanceFromHorizontalEdge: number
      distanceFromVerticalEdge: number
    }
  }
  updateChecker?: {
    // timestamp of the last time we checked for updates
    lastChecked: number
    result: UpdateCheckerResponse | 'error'
  }
  projects: {
    stateByProjectId: StrictRecord<
      ProjectId,
      {
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
  coreByProject: {[projectId in ProjectId]: ProjectState['ahistoric']}
}
