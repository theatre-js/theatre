// @flow
import {type ComponentID} from '$studio/componentModel/types'

export type PanelId = string

export type XY = {x: number, y: number}

export type PanelSettings = {
  pos: XY,
  dim: XY,
}

export type VisiblePanelsList = Array<PanelId>

export type Panels = {
  byId: {[key: PanelId]: PanelSettings},
  listOfVisibles: VisiblePanelsList,
}

export type WorkspaceNamespaceState = {
  panels: Panels,
  componentIDToBeRenderedAsCurrentCanvas: ?ComponentID,
}