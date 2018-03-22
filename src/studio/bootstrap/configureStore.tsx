import StoreAndStuff from '$lb/bootstrap/StoreAndStuff'
import rootSaga from './rootSaga'
import rootReducer from './rootReducer'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(
  config: typeof defaultConfig = defaultConfig,
): StoreAndStuff<$FixMe, $FixMe> {
  const store = new StoreAndStuff({...config})

  if (process.env.NODE_ENV === 'development' && module.hot) {
    // @todo
    // module.hot.accept('./rootReducer', () => {
    //   const r: $IntentionalAny = require
    //   store.reduxStore.dispatch(
    //     multiReduceStateAction([
    //       {
    //         path: ['componentModel', 'modifierDescriptors', 'core'],
    //         reducer: () =>
    //           r(
    //             '$studio/componentModel/coreModifierDescriptors/coreModifierDescriptors',
    //           ).default,
    //       },
    //       {
    //         path: ['componentModel', 'componentDescriptors', 'core'],
    //         reducer: () =>
    //           r(
    //             '$studio/componentModel/coreComponentDescriptors/coreComponentDescriptors',
    //           ).default,
    //       },
    //     ]),
    //   )
    // })
  }

  return store
}
