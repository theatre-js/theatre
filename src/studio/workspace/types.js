// @flow
import {type ComponentID} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'

export type PanelId = string

export type XY = D.MapOfReferences<{x: D.Reference<number>, y: D.Reference<number>}>

export type PanelSettings = D.MapOfReferences<{
  pos: XY,
  dim: XY,
}>

export type visiblePanelsList = D.ArrayOfReferences<D.Reference<PanelId>>

export type Panels = D.MapOfReferences<{
  byId: D.MapOfReferences<{[key: PanelId]: PanelSettings}>,
  listOfVisibles: visiblePanelsList,
}>

export type WorkspaceNamespaceState = D.MapOfReferences<{
  panels: Panels,
  componentIDToBeRenderedAsCurrentCanvas: D.Reference<?ComponentID>,
}>