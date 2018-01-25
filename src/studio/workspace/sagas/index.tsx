// @flow
import {PanelId,XY,PanelProps} from '$studio/workspace/types'
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'

export function* createPanel(params: PanelProps): Generator_<*, PanelId, *> {
  const id = generateUniqueId()
  const panelProperties = {
    id,
    ...params,
  }
  yield reduceState(['workspace', 'panels', 'byId', id], () => panelProperties)
  yield reduceState(['workspace', 'panels', 'listOfVisibles'], value =>
    value.concat(id),
  )
  return id
}

export function* setPanelSize(
  panelId: PanelId,
  dim: XY,
): Generator_<*, void, *> {
  yield reduceState(
    ['workspace', 'panels', 'byId', panelId, 'placementSettings', 'dim'],
    () => dim,
  )
}
