// @flow
import {type ComponentID} from '$studio/componentModel/types'

export type PanelId = string

export type PanelType = string

export type PanelConfiguration = Object

export type XY = {x: number, y: number}

export type PanelPlacementSettings = {
  pos: XY,
  dim: XY,
}

export type PanelProps = {
  type: PanelType,
  configuration: PanelConfiguration,
  placementSettings: PanelPlacementSettings,
}

export type PanelObject = PanelProps & {
  id: PanelId,
}

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: PanelId]: PanelObject},
  listOfVisibles: visiblePanelsList,
}

export type WorkspaceNamespaceState = {
  panels: Panels,
  currentCanvasCommponentID: ?ComponentID,
}