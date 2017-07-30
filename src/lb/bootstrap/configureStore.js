// @flow
import StandardStore from './StandardStore'
import rootReducer from './rootReducer'
import rootSaga from './rootSaga'

export const defaultConfig = {rootReducer, rootSaga}

export default function createStore(config: typeof defaultConfig = defaultConfig) {
  const store = new StandardStore(config)

  // let currentSagaTask = store.runRootSaga()

  // For hot reloading, we should probably just recreate the entire store instead of
  // just replacing the rootReducer and rootSaga
  // if (module.hot) {
  //   module.hot.accept('./rootSaga', async () => {
  //     console.log('Canceling the root saga due to HMR')
  //     await currentSagaTask.cancel()
  //     console.log('Root saga canceled due to HMR')
  //     store.rootSaga = require('./rootSaga').default
  //     currentSagaTask = store.runRootSaga()
  //   })

  //   module.hot.accept('./rootReducer', async () => {
  //     console.log('Canceling the root saga due to HMR')
  //     await currentSagaTask.cancel()
  //     console.log('Root saga canceled due to HMR')
  //     store.rootReducer = require('./rootReducer').default
  //     currentSagaTask = store.runRootSaga()
  //   })
  // }

  return store
}