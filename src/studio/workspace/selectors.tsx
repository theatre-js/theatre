import {Selector, IStoreState} from '$studio/types'
import {
  visiblePanelsList,
  PanelObject,
  PanelInput,
} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> = state =>
  state.persistedState.workspace.panels.listOfVisibles

export const getActivePanelId = (state: IStoreState) =>
  state.persistedState.workspace.panels.idOfActivePanel

export const getPanelById: Selector<PanelObject, string> = (state, panelId) =>
  state.persistedState.workspace.panels.byId[panelId]

export const getPanelInputs: Selector<Object, PanelInput> = (state, inputs) => {
  return Object.keys(inputs).reduce((obj, key) => {
    const panelId = inputs[key]
    return {
      ...obj,
      [key]: state.persistedState.workspace.panels.byId[panelId].outputs[key],
    }
  }, {})
}
