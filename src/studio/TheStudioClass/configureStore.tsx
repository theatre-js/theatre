// @flow
import StandardStore from '$lb/bootstrap/StandardStore'
import rootSaga from './rootSaga'
import {multiReduceState} from '$shared/utils'
import rootReducer from './rootReducer'
import defaultInitialState from './initialState'
import { debounce } from 'lodash';
import set from 'lodash/fp/set'

export const defaultConfig = {rootReducer, rootSaga}

const localStorageKey = 'tjs-componentModel-8';
export default function createStore(
  config: typeof defaultConfig = defaultConfig,
): StandardStore<$FixMe, $FixMe> {
  let initialState = defaultInitialState
  try {
    const ia = localStorage.getItem(localStorageKey)
    if (ia) {
      // debugger
      // initialState = set(['componentModel', 'componentDescriptors', 'custom'], JSON.parse(ia), initialState)
    }
  } catch (e) {

  }
  
  const store = new StandardStore({...config, initialState})
  const updateLocalStorage = () => {
    localStorage.setItem(localStorageKey, JSON.stringify(store.reduxStore.getState().componentModel.componentDescriptors.custom))
  }
  store.reduxStore.subscribe(debounce(updateLocalStorage, 500))
  
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
