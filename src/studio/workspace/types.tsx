import {IComponentId} from '$theater/componentModel/types'
import * as t from '$shared/ioTypes/index'

export const $IPanelId = t.string
export type IPanelId = t.StaticTypeOf<typeof $IPanelId>

export const $IPanelType = t.string
export type IPanelType = t.StaticTypeOf<typeof $IPanelType>

export const $IXY = t.type({x: t.number, y: t.number}, 'XY')
export type IXY = t.StaticTypeOf<typeof $IXY>

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
export type IPanelBoundary = t.StaticTypeOf<typeof $IPanelBoundary>

export const $IPanelBoundaries = t.type(
  {
    top: $IPanelBoundary,
    right: $IPanelBoundary,
    bottom: $IPanelBoundary,
    left: $IPanelBoundary,
  },
  'IPanelBoundaries',
)
export type IPanelBoundaries = t.StaticTypeOf<typeof $IPanelBoundaries>

export const $IWorkspacePanel = t.type(
  {
    type: $IPanelType,
    id: $IPanelId,
    boundaries: $IPanelBoundaries,
  },
  'IWorkspacePanel',
)
export type IWorkspacePanel = t.StaticTypeOf<typeof $IWorkspacePanel>

export type visiblePanelsList = Array<string>

export type Panels = {
  byId: {[id: string]: IWorkspacePanel}
  listOfVisibles: visiblePanelsList
  panelObjectBeingDragged: undefined | null | $FixMe
  idOfActivePanel: undefined | null | string
}

const $IPanels = t.type(
  {
    byId: t.record(t.string, $IWorkspacePanel, 'PanelsById'),
    listOfVisibles: t.array($IPanelId),
    panelObjectBeingDragged: t.fixMe,
    idOfActivePanel: t.maybe(t.string),
  },
  'IWorkspacePanels',
)

export const $IViewport = t.type(
  {
    id: t.string,
    dimensions: t.type({width: t.number, height: t.number}),
    position: t.type({x: t.number, y: t.number}),
    sceneComponentId: t.string,
  },
  'Viewport',
)
export type IViewport = t.StaticTypeOf<typeof $IViewport>

export const $IViewports = t.type(
  {
    byId: t.record(t.string, $IViewport),
    activeViewportId: t.union([t.undefined, t.string], 'activeViewportId'),
    whatToShowInBody: t.taggedUnion(
      'type',
      [
        t.type({type: t.literal('Passthrough')}),
        t.type({type: t.literal('Viewports')}),
        t.type({type: t.literal('Viewport'), id: t.string}),
        t.type({
          type: t.literal('TestingOnly:DirectlyRenderComponent'),
          componentId: t.string,
        }),
      ],
      'WhatTShowInBody',
    ),
  },
  'IViewports',
)
export type IViewports = t.StaticTypeOf<typeof $IViewports>

export const $IWorkspaceHistoricState = t.type(
  {
    panels: $IPanels,
    viewports: $IViewports,
  },
  'IWorkspaceNamespaceHistoricState',
)
export type IWorkspaceHistoricState = t.StaticTypeOf<
  typeof $IWorkspaceHistoricState
>

export const $IViewportsContainer = t.type(
  {
    scrollX: t.number,
    scrollY: t.number,
  },
  'ViewportsContainer',
)
export type IViewportsContainer = t.StaticTypeOf<typeof $IViewportsContainer>

export const $IWorkspaceAhistoricState = t.type({
  activeNodeVolatileIdByViewportId: t.record(t.string, t.string),
  viewportsContainer: $IViewportsContainer,
})
export type IWorkspaceAhistoricState = t.StaticTypeOf<
  typeof $IWorkspaceAhistoricState
>

// export type IWorkspaceAhistoricState = {
//   activeNodeVolatileIdByViewportId: Record<string, string>
//   viewportsContainer: IViewportsContainer
// }
