// @flow
import {
  type PanelId,
  type XY,
  type PanelType,
  type PanelPlacementSettings,
  type PanelProperties} from '$studio/workspace/types'
import {reduceState} from '$shared/utils'
import generateUniqueId from 'uuid/v4'

export function* createPanel(params: {type: PanelType, defaultConfig: $FlowFixMe, defaultPlacement: PanelPlacementSettings}): Generator<*, void, *> {
  const id = generateUniqueId()
  const panelProperties: PanelProperties = {
    id,
    type: params.type,
    configuration: params.defaultConfig,
    placementSettings: params.defaultPlacement,
  }

  yield reduceState(['workspace', 'panels', 'byId', id], () => panelProperties)
  yield reduceState(['workspace', 'panels', 'listOfVisibles'], (value) => value.concat(id))
}

export function* setPanelPosition(panelId: PanelId, pos: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'placementSettings', 'pos'], () => pos)
}

export function* setPanelSize(panelId: PanelId, dim: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'placementSettings', 'dim'], () => dim)
}