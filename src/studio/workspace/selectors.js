// @flow
import {type Selector} from '$studio/types'
import {type visiblePanelsList, type PanelObject, type DraggingOutput, type PanelInput} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> =
  (state) => state.workspace.panels.listOfVisibles

export const getPanelById: Selector<PanelObject, string> =
  (state, panelId) => state.workspace.panels.byId[panelId]

export const getCurrentlyDraggingOutput: Selector<DraggingOutput, void> =
  (state) => state.workspace.panels.currentlyDraggingOutput

export const getPanelInputs: Selector<Object, PanelInput> = (state, inputs) => {
  return Object.keys(inputs).reduce((obj, key) => {
    const panelId = inputs[key]
    return obj = {
      ...obj,
      [key]: state.workspace.panels.byId[panelId].outputs[key],
    }
  }, {})
}