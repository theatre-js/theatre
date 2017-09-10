// @flow
import {type PanelId, type XY, type PanelProps} from '$studio/workspace/types'
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'

export function* createPanel(params: PanelProps): Generator<*, PanelId, *> {
  const id = generateUniqueId()
  const panelProperties = {
    id,
    ...params,
  }
  yield reduceState(['workspace', 'panels', 'byId', id], () => panelProperties)
  yield reduceState(['workspace', 'panels', 'listOfVisibles'], (value) => value.concat(id))
  return id
}

export function* setPanelPosition(panelId: PanelId, pos: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'placementSettings', 'pos'], () => pos)
}

export function* setPanelSize(panelId: PanelId, dim: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'placementSettings', 'dim'], () => dim)
}

export function* updatePanelData(panelId: PanelId, property: string, newData: Object): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, property], (data) => ({...data, ...newData}))
}
