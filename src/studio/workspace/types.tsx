// @flow
import {ComponentId} from '$studio/componentModel/types'

export type PanelId = string

export type PanelType = string

export type PanelConfiguration = Object

export type PanelPersistentState = {
  isInSettings: boolean
}

export type XY = {x: number; y: number}

export type PanelPlacementSettings = {
  pos: XY
  dim: XY
}

export type PanelOutput = {[string]: Object}

export type PanelInput = {[string]: PanelId}

export type DraggingOutput = {
  type: string
  panel: PanelId
}

export type PanelProps = {
  type: PanelType
  configuration: PanelConfiguration
  placementSettings: PanelPlacementSettings
  persistentState: PanelPersistentState
  inputs: PanelInput
  outputs: PanelOutput
}

export type PanelObject = PanelProps & {
  id: PanelId
}

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: PanelId]: PanelObject}
  listOfVisibles: visiblePanelsList
  currentlyDraggingOutput: undefined | null | DraggingOutput
  idOfActivePanel: undefined | null | string
}

export type WorkspaceNamespaceState = {
  panels: Panels
  componentIdToBeRenderedAsCurrentCanvas: undefined | null | ComponentId
}
