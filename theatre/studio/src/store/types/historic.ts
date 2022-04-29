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
import type {
  ObjectAddressKey,
  PaneInstanceId,
  ProjectId,
  SheetId,
  SheetInstanceId,
  UIPanelId,
} from '@theatre/shared/utils/ids'

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

export type PaneInstanceDescriptor = {
  instanceId: PaneInstanceId
  paneClass: string
}

/**
 * See parent {@link StudioHistoricStateProject}.
 * See root {@link StudioHistoricState}
 */
export type StudioHistoricStateProjectSheet = {
  selectedInstanceId: undefined | SheetInstanceId
  sequenceEditor: {
    selectedPropsByObject: StrictRecord<
      ObjectAddressKey,
      StrictRecord<PathToProp_Encoded, keyof typeof graphEditorColors>
    >
  }
}

/** See {@link StudioHistoricState} */
export type StudioHistoricStateProject = {
  stateBySheetId: StrictRecord<SheetId, StudioHistoricStateProjectSheet>
}

/**
 * {@link StudioHistoricState} includes both studio and project data, and
 * contains data changed for an undo/redo history.
 *
 * ## Internally
 *
 * We use immer `Draft`s to encapsulate this whole state to then be operated
 * on by each transaction. The derived values from the store will also include
 * the application of the "temp transactions" stack.
 */
export type StudioHistoricState = {
  projects: {
    stateByProjectId: StrictRecord<ProjectId, StudioHistoricStateProject>
  }

  /** Panels can contain panes */
  panels?: Panels
  /** Panels can contain panes */
  panelPositions?: {[panelId in UIPanelId]?: PanelPosition}
  // This is misspelled, but I think some users are dependent on the exact shape of this stored JSON
  // So, we cannot easily change it without providing backwards compatibility.
  panelInstanceDesceriptors: StrictRecord<
    PaneInstanceId,
    PaneInstanceDescriptor
  >
  autoKey: boolean
  coreByProject: Record<ProjectId, ProjectState_Historic>
}
