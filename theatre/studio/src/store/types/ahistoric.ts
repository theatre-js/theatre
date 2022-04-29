import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {ProjectId} from '@theatre/shared/utils/ids'
import type {IRange, StrictRecord} from '@theatre/shared/utils/types'

export type StudioAhistoricState = {
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
  projects: {
    stateByProjectId: StrictRecord<
      string,
      {
        stateBySheetId: StrictRecord<
          string,
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
            }
          }
        >
      }
    >
  }
  coreByProject: {[projectId in ProjectId]: ProjectState['ahistoric']}
}
