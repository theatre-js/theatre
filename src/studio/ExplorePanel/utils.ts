import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {val} from '$shared/DataVerse2/atom'
import Studio from '$studio/bootstrap/Studio'

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

export const getComponentIdOfActiveNode = (
  studio: Studio,
): string | undefined => {
  const possibleVolatileIdOfSelectedElement = getVolatileIdOfActiveNode(studio)

  if (!possibleVolatileIdOfSelectedElement) return undefined

  const mirrorNode = val(
    studio.elementTree.mirrorOfReactTreeAtom.pointer.nodesByVolatileId[
      possibleVolatileIdOfSelectedElement
    ],
  )

  if (!mirrorNode || mirrorNode.type !== 'Generic') return undefined

  const reactElement = mirrorNode.nativeNode
  if (!isTheaterComponent(reactElement)) return undefined
  return (reactElement.constructor as $IntentionalAny).componentId
}
