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

export type PanelOutput = {[key: string]: Object}

export type PanelInput = {[key: string]: PanelId}

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
  byId: {[id: string]: PanelObject}
  listOfVisibles: visiblePanelsList
  panelObjectBeingDragged: undefined | null | $FixMe
  idOfActivePanel: undefined | null | string
}

type ViewportCanvas = {
  id: string
  name: stringv
  viewports: Record<string, true>
  activeViewportId: undefined | string
}

type Viewport = {
  id: string
  dimensions: {width: number; height: number}
  position: {x: number; y: number}
  viewportCanvasId: string
  sceneComponentId: ComponentId
}

export type WorkspaceNamespaceState = {
  panels: Panels
  componentIdToBeRenderedAsCurrentCanvas: undefined | null | ComponentId

  viewports: {
    byId: Record<string, Viewport>
    /**
     * This designates which viewport is active, but only when the viewport*s
     * view is showing. In other words, this is only relevant if
     * `whatToShowInBody.type === 'Viewports'`
     */
    activeViewportId: undefined | string
    whatToShowInBody:
      | {type: 'Passthrough'}
      | {type: 'Viewports'}
      | {type: 'Viewport'; id: string}
  }
}
