import StandardStore from '$lb/bootstrap/StandardStore'
import rootSaga from './rootSaga'
import {multiReduceState} from '$shared/utils'
import rootReducer from './rootReducer'
import defaultInitialState from './initialState'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(
  config: typeof defaultConfig = defaultConfig,
): StandardStore<$FixMe, $FixMe> {
  const initialState = defaultInitialState

  const store = new StandardStore({...config, initialState})

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () => {
      store.runSaga(function*(): Generator_<$FixMe, $FixMe, $FixMe> {
        const r: $IntentionalAny = require
        yield multiReduceState([
          {
            path: ['componentModel', 'modifierDescriptors', 'core'],
            reducer: () =>
              r(
                '$studio/componentModel/coreModifierDescriptors/coreModifierDescriptors',
              ).default,
          },
          {
            path: ['componentModel', 'componentDescriptors', 'core'],
            reducer: () =>
              r(
                '$studio/componentModel/coreComponentDescriptors/coreComponentDescriptors',
              ).default,
          },
        ])
      })
    })
  }

  return store
}
