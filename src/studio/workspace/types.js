// @flow
export type PanelId = string

export type PanelType = string

export type PanelConfiguration = Object

export type XY = {x: number, y: number}

export type PanelProperties = {
  id: PanelId,
  type: PanelType,
  configuration: PanelConfiguration,
  placementSettings: PanelPlacementSettings,
}

export type PanelPlacementSettings = {
  pos: XY,
  dim: XY,
}

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: PanelId]: PanelProperties},
  listOfVisibles: visiblePanelsList,
}

export type WorkspaceNamespaceState = {
  panels: Panels,
}