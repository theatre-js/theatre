import {StudioStatePersistorNamespaceState} from '$lb/studioStatePersistor/types'

const defaultState: StudioStatePersistorNamespaceState = {
  byPath: {},
}

export default (state: StudioStatePersistorNamespaceState = defaultState) =>
  state
