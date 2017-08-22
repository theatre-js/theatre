// @flow
import {type PanelId, type XY} from '$studio/workspace/types'
import {reduceState} from '$shared/utils'

export function* setPanelPosition(panelId: PanelId, pos: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'pos'], () => pos)
}

export function* setPanelSize(panelId: PanelId, dim: XY): Generator<*, void, *> {
  yield reduceState(['workspace', 'panels', 'byId', panelId, 'dim'], () => dim)
}