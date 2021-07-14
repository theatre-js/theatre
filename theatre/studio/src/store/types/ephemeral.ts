import type {ProjectState} from '@theatre/core/projects/store/storeTypes'
import type {
  $IntentionalAny,
  SerializableMap,
  StrictRecord,
} from '@theatre/shared/utils/types'
import type {
  IExtension,
  PaneClassDefinition,
} from '@theatre/studio/TheatreStudio'

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
  extensions: {
    byId: {[extensionId in string]?: IExtension}
    paneClasses: {
      [paneClassName in string]?: {
        extensionId: string
        classDefinition: PaneClassDefinition<$IntentionalAny>
      }
    }
  }
}
