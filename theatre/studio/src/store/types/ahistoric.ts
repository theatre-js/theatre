import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {IRange, StrictRecord} from '@theatre/shared/utils/types'
import type {Keyframe} from '@theatre/core/projects/store/types/SheetState_Historic'
import type {PathToProp} from '@theatre/shared/utils/addresses'

export type TracksClipboard = {
  version: '1'
  pathToProp: PathToProp
  trackId: string
  keyframes: Keyframe[]
}

export type StudioAhistoricState = {
  visibilityState: 'everythingIsHidden' | 'everythingIsVisible'
  tracksClipboard?: TracksClipboard[]

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
