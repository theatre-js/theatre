import type {ProjectState_Historic} from '@theatre/core/projects/store/storeTypes'
import type {graphEditorColors} from '@theatre/studio/panels/SequenceEditorPanel/GraphEditor/GraphEditor'
import type {
  PathToProp_Encoded,
  ProjectAddress,
  SheetAddress,
  SheetObjectAddress,
  WithoutSheetInstance,
} from '@theatre/shared/utils/addresses'
import type {StrictRecord} from '@theatre/shared/utils/types'
import type Project from '@theatre/core/projects/Project'
import type Sheet from '@theatre/core/sheets/Sheet'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'

export type PanelPosition = {
  edges: {
    left: {
      from: 'screenLeft' | 'screenRight'
      distance: number
    }
    right: {
      from: 'screenLeft' | 'screenRight'
      distance: number
    }
    top: {
      from: 'screenTop' | 'screenBottom'
      distance: number
    }
    bottom: {
      from: 'screenTop' | 'screenBottom'
      distance: number
    }
  }
}

type Panels = {
  sequenceEditor?: {
    graphEditor?: {
      isOpen?: boolean
      height?: number
    }
  }
  objectEditor?: {}
  outlinePanel?: {
    selection?: OutlineSelectionState[]
  }
}

export type PanelId = keyof Panels

export type OutlineSelectionState =
  | ({type: 'Project'} & ProjectAddress)
  | ({type: 'Sheet'} & WithoutSheetInstance<SheetAddress>)
  | ({type: 'SheetObject'} & WithoutSheetInstance<SheetObjectAddress>)

export type OutlineSelectable = Project | Sheet | SheetObject
export type OutlineSelection = OutlineSelectable[]

export type PanelInstanceDescriptor = {
  instanceId: string
  paneClass: string
}

export type StudioHistoricState = {
  projects: {
    stateByProjectId: StrictRecord<
      string,
      {
        stateBySheetId: StrictRecord<
          string,
          {
            selectedInstanceId: undefined | string
            sequenceEditor: {
              selectedPropsByObject: StrictRecord<
                string,
                StrictRecord<PathToProp_Encoded, keyof typeof graphEditorColors>
              >
            }
          }
        >
      }
    >
  }

  panels?: Panels
  panelPositions?: {[panelIdOrPaneId in string]?: PanelPosition}
  panelInstanceDesceriptors: {
    [instanceId in string]?: PanelInstanceDescriptor
  }
  autoKey: boolean
  coreByProject: {[projectId in string]: ProjectState_Historic}
}
