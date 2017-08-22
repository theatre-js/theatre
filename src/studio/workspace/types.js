// @flow
export type PanelId = string

export type XY = {x: number, y: number}

export type PanelSettings = {
  pos: XY,
  dim: XY,
}

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: PanelId]: PanelSettings},
  listOfVisibles: visiblePanelsList,
}

export type WorkspaceNamespaceState = {
  panels: Panels,
}