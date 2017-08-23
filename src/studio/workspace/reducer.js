// @flow
import type {WorkspaceNamespaceState} from './types'

const defaultState: WorkspaceNamespaceState = {
  panels: {
    byId: {
      '1': {
        id: '1',
        type: 'elementTree',
        configuration: {},
        placementSettings: {
          pos: {x: 5, y: 10},
          dim: {x: 30, y: 40},
        },
      },
      '2': {
        id: '1',
        type : 'elementInspector',
        configuration: {},
        placementSettings: {
          pos: {x: 50, y: 30},
          dim: {x: 30, y: 40},
        },
      },
    },
    listOfVisibles: ['1', '2'],
  },
}

export default (state: WorkspaceNamespaceState = defaultState) => state