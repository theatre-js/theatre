import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {SerializableMap, StrictRecord} from '@theatre/shared/utils/types'

export type StudioEphemeralState = {
  initialised: boolean
  coreByProject: {[projectId in string]: ProjectState['ephemeral']}
  projects: {
    stateByProjectId: StrictRecord<
      string,
      {
        stateBySheetId: StrictRecord<
          string,
          {
            stateByObjectKey: StrictRecord<
              string,
              {
                valuesBeingScrubbed?: SerializableMap<boolean>
              }
            >
          }
        >
      }
    >
  }
}
