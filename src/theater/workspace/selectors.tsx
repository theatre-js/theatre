import {Selector, ITheaterStoreState} from '$theater/types'
import {
  visiblePanelsList,
  PanelObject,
  PanelInput,
} from '$theater/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> = state =>
  state.historicWorkspace.panels.listOfVisibles

export const getActivePanelId = (state: ITheaterStoreState) =>
  state.historicWorkspace.panels.idOfActivePanel

export const getPanelById: Selector<PanelObject, string> = (state, panelId) =>
  state.historicWorkspace.panels.byId[panelId]

export const getPanelInputs: Selector<Object, PanelInput> = (state, inputs) => {
  return Object.keys(inputs).reduce((obj, key) => {
    const panelId = inputs[key]
    return {
      ...obj,
      [key]: state.historicWorkspace.panels.byId[panelId].outputs[key],
    }
  }, {})
}
