import StoreAndStuff from '$lb/bootstrap/StoreAndStuff'
import rootReducer from './rootReducer'
import rootSaga from './rootSaga'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(
  config: typeof defaultConfig = defaultConfig,
) {
  const store = new StoreAndStuff(config)

  return store
}
