// @flow
import StandardStore from '$lb/bootstrap/StandardStore'
import rootSaga from './rootSaga'
import {multiReduceState} from '$shared/utils'
import rootReducer from './rootReducer'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(
  config: typeof defaultConfig = defaultConfig,
): StandardStore<$FixMe, $FixMe> {
  const store = new StandardStore(config)

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () => {
      store.runSaga(function*(): Generator_<$FixMe, $FixMe, $FixMe> {
        const r: $IntentionalAny = require
        yield multiReduceState([
          {
            path: ['componentModel', 'modifierDescriptors', 'core'],
            reducer: () =>
              r('$studio/componentModel/coreModifierDescriptors').default,
          },
          {
            path: ['componentModel', 'componentDescriptors', 'core'],
            reducer: () =>
              r('$studio/componentModel/coreComponentDescriptors').default,
          },
        ])
      })
    })
  }

  return store
}
