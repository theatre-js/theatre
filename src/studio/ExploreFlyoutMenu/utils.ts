import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {val} from '$shared/DataVerse2/atom'
import Theater from '$studio/bootstrap/Theater'
import {isViewportNode} from '$studio/workspace/components/WhatToShowInBody/Viewports/Viewport'

export const getActiveViewportId = (theater: Theater): string | undefined => {
  return val(theater.atom2.pointer.historicWorkspace.viewports.activeViewportId)
}

export const getVolatileIdOfActiveNode = (
  theater: Theater,
): string | undefined => {
  const activeViewportId = getActiveViewportId(theater)
  if (!activeViewportId) return undefined

  return val(
    theater.atom2.pointer.ahistoricWorkspace.activeNodeVolatileIdByViewportId[
      activeViewportId
    ],
  )
}

export const getActiveNodeInstanceByVolatileId = (
  volatileId: string,
  theater: Theater,
) => {
  const mirrorNode = val(
    theater.studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[
      volatileId
    ],
  )

  if (!mirrorNode || mirrorNode.type !== 'Generic') return undefined

  const reactElement = mirrorNode.nativeNode
  return reactElement
}

export const getActiveNode = (theater: Theater): mixed => {
  const possibleVolatileIdOfSelectedElement = getVolatileIdOfActiveNode(theater)

  if (!possibleVolatileIdOfSelectedElement) return undefined
  const volatileId = possibleVolatileIdOfSelectedElement
  const activeNode = getActiveNodeInstanceByVolatileId(volatileId, theater)
  return activeNode
}

export const getComponentIdOfNode = (node: mixed): undefined | string => {
  if (!isTheaterComponent(node)) return undefined
  return node.constructor.componentId
}

export const getComponentIdOfActiveNode = (
  theater: Theater,
): string | undefined => {
  const activeNode = getActiveNode(theater)
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