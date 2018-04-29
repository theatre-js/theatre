import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {val} from '$shared/DataVerse2/atom'
import Studio from '$studio/bootstrap/Studio'
import {isViewportNode} from '$studio/workspace/components/WhatToShowInBody/Viewports/Viewport'

export const getActiveViewportId = (studio: Studio): string | undefined => {
  return val(studio.atom2.pointer.historicWorkspace.viewports.activeViewportId)
}

export const getVolatileIdOfActiveNode = (
  studio: Studio,
): string | undefined => {
  const activeViewportId = getActiveViewportId(studio)
  if (!activeViewportId) return undefined

  return val(
    studio.atom2.pointer.ahistoricWorkspace.activeNodeVolatileIdByViewportId[
      activeViewportId
    ],
  )
}

export const getActiveNodeInstanceByVolatileId = (
  volatileId: string,
  studio: Studio,
) => {
  const mirrorNode = val(
    studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[
      volatileId
    ],
  )

  if (!mirrorNode || mirrorNode.type !== 'Generic') return undefined

  const reactElement = mirrorNode.nativeNode
  return reactElement
}

export const getActiveNode = (studio: Studio): mixed => {
  const possibleVolatileIdOfSelectedElement = getVolatileIdOfActiveNode(studio)

  if (!possibleVolatileIdOfSelectedElement) return undefined
  const volatileId = possibleVolatileIdOfSelectedElement
  const activeNode = getActiveNodeInstanceByVolatileId(volatileId, studio)
  return activeNode
}

export const getComponentIdOfNode = (node: mixed): undefined | string => {
  if (!isTheaterComponent(node)) return undefined
  return node.constructor.componentId
}

export const getComponentIdOfActiveNode = (
  studio: Studio,
): string | undefined => {
  const activeNode = getActiveNode(studio)
  if (!activeNode) return undefined

  return getComponentIdOfNode(activeNode)
}

export enum NodeType {
  TheaterElement,
  Viewport,
}

export const getTypeOfNode = (node: $FixMe) => {
  return isTheaterComponent(node)
    ? NodeType.TheaterElement
    : isViewportNode(node)
      ? NodeType.Viewport
      : undefined
}
