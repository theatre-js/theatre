import {Selector, IStudioStoreState} from '$studio/types'
import {
  visiblePanelsList,
  PanelObject,
  PanelInput,
} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> = state =>
  state.workspace.panels.listOfVisibles

export const getActivePanelId = (state: IStudioStoreState) =>
  state.workspace.panels.idOfActivePanel

export const getPanelById: Selector<PanelObject, string> = (state, panelId) =>
  state.workspace.panels.byId[panelId]

export const getPanelInputs: Selector<Object, PanelInput> = (state, inputs) => {
  return Object.keys(inputs).reduce((obj, key) => {
    const panelId = inputs[key]
    return {
      ...obj,
      [key]: state.workspace.panels.byId[panelId].outputs[key],
    }
  }, {})
}
