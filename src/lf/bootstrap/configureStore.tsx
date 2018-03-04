
import StandardStore from '$lb/bootstrap/StandardStore'
import rootReducer from './rootReducer'
import rootSaga from './rootSaga'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(
  config: typeof defaultConfig = defaultConfig,
) {
  const store = new StandardStore(config)

  return store
}
