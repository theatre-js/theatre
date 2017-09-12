// @flow
import {type Selector} from '$studio/types'
import {type visiblePanelsList, type PanelObject} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> =
  (state) => state.workspace.panels.listOfVisibles

export const getPanelById: Selector<PanelObject, string> =
  (state, panelId) => state.workspace.panels.byId[panelId]

export const getCurrentlyDraggingOutput: Selector<$FlowFixMe, void> =
  (state) => state.workspace.panels.currentlyDraggingOutput

export const getPanelInputs: Selector<$FlowFixMe, $FlowFixMe> = (state, inputs) => {
  return Object.keys(inputs).reduce((obj, key) => {
    const panelId = inputs[key]
    return obj = {
      ...obj,
      [key]: state.workspace.panels.byId[panelId].outputs[key],
    }
  }, {})
}