// @flow
import {type Selector} from '$studio/types'
import {type visiblePanelsList, type PanelSettings} from '$studio/workspace/types'

export const getVisiblePanelsList: Selector<visiblePanelsList, void> =
  (state) => state.workspace.panels.listOfVisibles

export const getPanelById: Selector<PanelSettings, string> =
  (state, panelId) => state.workspace.panels.byId[panelId]