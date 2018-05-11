import {ComponentId} from '$theater/componentModel/types'
import * as t from '$shared/ioTypes/index'

export const $IPanelId = t.string
export type IPanelId = t.TypeOf<typeof $IPanelId>

export const $IPanelType = t.string
export type IPanelType = t.TypeOf<typeof $IPanelType>

export type XY = {x: number; y: number}

const $IPanelBoundaryDim = t.union([
  t.literal('top'),
  t.literal('right'),
  t.literal('bottom'),
  t.literal('left'),
])

export const $IPanelBoundary = t.taggedUnion(
  'type',
  [
    t.type({
      type: t.literal('sameAsBoundary'),
      path: t.tuple([t.string, $IPanelBoundaryDim]),
    }),
    t.type({
      type: t.literal('distanceFromBoundary'),
      path: t.tuple([t.string, $IPanelBoundaryDim]),
      distance: t.number,
    }),
  ],
  'IPanelBoundary',
)
export type IPanelBoundary = t.TypeOf<typeof $IPanelBoundary>

export const $IPanelBoundaries = t.type(
  {
    top: $IPanelBoundary,
    right: $IPanelBoundary,
    bottom: $IPanelBoundary,
    left: $IPanelBoundary,
  },
  'IPanelBoundaries',
)
export type IPanelBoundaries = t.TypeOf<typeof $IPanelBoundaries>

export const $IWorkspacePanel = t.type(
  {
    type: $IPanelType,
    id: $IPanelId,
    boundaries: $IPanelBoundaries,
  },
  'IWorkspacePanel',
)
export type IWorkspacePanel = t.TypeOf<typeof $IWorkspacePanel>

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: string]: IWorkspacePanel}
  listOfVisibles: visiblePanelsList
  panelObjectBeingDragged: undefined | null | $FixMe
  idOfActivePanel: undefined | null | string
}

const $IPanels = t.type(
  {
    byId: t.dictionary(t.string, $IWorkspacePanel, 'PanelsById'),
    listOfVisibles: t.array($IPanelId),
    panelObjectBeingDragged: t.fixMe,
    idOfActivePanel: t.optional
  },
  'IWorkspacePanels',
)

export type IViewport = {
  id: string
  dimensions: {width: number; height: number}
  position: {x: number; y: number}
  sceneComponentId: ComponentId
}

const $IWorkspaceNamespaceHistoricState = t.type(
  {
    panels: $IPanels,
  },
  'IWorkspaceNamespaceHistoricState',
)

export type IWorkspaceNamespaceHistoricState = {
  panels: Panels

  viewports: {
    byId: Record<string, IViewport>
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
      | {type: 'TestingOnly:DirectlyRenderComponent'; componentId: string}
  }
}

export type ViewportsContainer = {
  scrollX: number
  scrollY: number
}

export type IWorkspaceNamespaceAHistoricState = {
  activeNodeVolatileIdByViewportId: Record<string, string>
  viewportsContainer: ViewportsContainer
}
