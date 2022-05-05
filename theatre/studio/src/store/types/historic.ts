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
import type {PointableSet} from '@theatre/shared/utils/PointableSet'
import type Project from '@theatre/core/projects/Project'
import type Sheet from '@theatre/core/sheets/Sheet'
import type SheetObject from '@theatre/core/sheetObjects/SheetObject'
import type {
  ObjectAddressKey,
  PaneInstanceId,
  ProjectId,
  SequenceMarkerId,
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
 * Marker allows you to mark notable positions in your sequence.
 *
 * See root {@link StudioHistoricState}
 */
export type StudioHistoricStateSequenceEditorMarker = {
  id: SequenceMarkerId
  /**
   * The position this marker takes in the sequence.
   *
   * Usually, this value is measured in seconds, but the unit could be varied based on the kind of
   * unit you're using for mapping to the position (e.g. Position=1 = 10px of scrolling)
   */
  position: number
}

/**
 * See parent {@link StudioHistoricStateProject}.
 * See root {@link StudioHistoricState}
 */
export type StudioHistoricStateProjectSheet = {
  selectedInstanceId: undefined | SheetInstanceId
  sequenceEditor: {
    markerSet?: PointableSet<
      SequenceMarkerId,
      StudioHistoricStateSequenceEditorMarker
    >
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
