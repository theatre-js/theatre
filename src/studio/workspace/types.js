// @flow
import {type ComponentId} from '$studio/componentModel/types'
import * as D from '$shared/DataVerse'

export type PanelId = string

export type XY = D.ObjectLiteral<{x: D.PrimitiveLiteral<number>, y: D.PrimitiveLiteral<number>}>

export type PanelSettings = D.ObjectLiteral<{
  pos: XY,
  dim: XY,
}>

export type VisiblePanelsList = D.ArrayLiteral<D.PrimitiveLiteral<PanelId>>

export type Panels = D.ObjectLiteral<{
  byId: D.ObjectLiteral<{[key: PanelId]: PanelSettings}>,
  listOfVisibles: VisiblePanelsList,
}>

export type WorkspaceNamespaceState = D.ObjectLiteral<{
  panels: Panels,
  componentIdToBeRenderedAsCurrentCanvas: D.PrimitiveLiteral<?ComponentId>,
}>