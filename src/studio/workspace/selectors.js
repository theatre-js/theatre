
import {type Selector} from '$studio/types'
import {type VisiblePanelsList, type PanelSettings} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<VisiblePanelsList, void> =
  (state) => state.workspace.panels.listOfVisibles

export const getPanelById: Selector<PanelSettings, string> =
  (state, panelId) => state.workspace.panels.byId[panelId]