// @flow
import StandardStore from '$lb/bootstrap/StandardStore'
import rootReducer from './rootReducer'
import rootSaga from './rootSaga'
import {reduceState} from '$shared/utils'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(config: typeof defaultConfig = defaultConfig): StandardStore<*, *> {
  const store = new StandardStore(config)
  // debugger

  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./rootReducer', () => {
      debugger
    })

    // $FixMe
    module.hot.accept(
      '$studio/componentModel/coreComponentDescriptors',
      () => {
        debugger
        store.runSaga(function*(): Generator<*, *, *> {
          const newCoreComponentDescriptors = require('$studio/componentModel/coreComponentDescriptors').default
          yield reduceState(['componentModel', 'comopnentDescriptors', 'core'], () => newCoreComponentDescriptors)
        })

        // atom.setProp('coreComponentDescriptorsById', D.atoms.atomifyDeep(newCoreComponentDescriptors))
      }
    )

    // $FixMe
    module.hot.accept(
      '$studio/componentModel/coreModifierDescriptors',
      () => {
        store.runSaga(function*(): Generator<*, *, *> {
          const newModifierDescriptors = require('$studio/componentModel/coreModifierDescriptors').default
          yield reduceState(['componentModel', 'modifierDescriptors', 'core'], () => newModifierDescriptors)
        })
        // const newModifierDescriptors = require('$studio/componentModel/coreModifierDescriptors').default
        // atom.setProp('coreModifierDescriptorsById', D.atoms.atomifyDeep(newModifierDescriptors))
      }
    )
  }

  return store
}