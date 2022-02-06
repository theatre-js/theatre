import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {IRange, StrictRecord} from '@theatre/shared/utils/types'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'

export type StudioAhistoricState = {
  visibilityState: 'everythingIsHidden' | 'everythingIsVisible'
  keyframesClipboard: Keyframe[]

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
