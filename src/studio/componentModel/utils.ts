import {isTheaterComponent} from '$studio/componentModel/react/TheaterComponent/TheaterComponent'
import {val} from '$shared/DataVerse2/atom'
import Studio from '$studio/bootstrap/Studio'

export const getVolatileIdOfSelectedElement = (
  studio: Studio,
): string | undefined => {
  return val(
    studio.atom2.pointer.ahistoricComponentModel.selectedElementVolatileId,
  )
}

export const getComponentIdOfSelectedElement = (
  studio: Studio,
): string | undefined => {
  const possibleVolatileIdOfSelectedElement = getVolatileIdOfSelectedElement(
    studio,
  )

  if (!possibleVolatileIdOfSelectedElement) return undefined

  const mirrorNode = val(
    studio._mirrorOfReactTree.atom.pointer.nodesByVolatileId[
      possibleVolatileIdOfSelectedElement
    ],
  )

  if (!mirrorNode || mirrorNode.type !== 'Generic') return undefined

  const reactElement = mirrorNode.nativeNode
  if (!isTheaterComponent(reactElement)) return undefined
  return (reactElement.constructor as $IntentionalAny).componentId
}
