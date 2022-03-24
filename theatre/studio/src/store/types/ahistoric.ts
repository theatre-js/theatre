import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
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
              clippedSpaceRange?: IRange
            }
          }
        >
      }
    >
  }
  coreByProject: {[projectId in string]: ProjectState['ahistoric']}
}
