import 'babel-polyfill'
import initialConfigureStore from '$lb/bootstrap/configureStore'
// import 'source-map-support/register'

let configureStore = initialConfigureStore
let lastStoreSagaTask = configureStore().runRootSaga()
// let lastCancelPromise: null | Promise<mixed> = null

// if (module.hot) {
//   module.hot.accept('$lb/bootstrap/configureStore', () => {
//     configureStore = require('$lb/bootstrap/configureStore').default

//     if (!lastCancelPromise) {
//       lastStoreSagaTask.cancel()

//       lastCancelPromise = lastStoreSagaTask.done.then(() => {
//         lastStoreSagaTask = configureStore().runRootSaga()
//         lastCancelPromise = null
//       })
//     }
//   })
// }

/**
 * @note We can use HMR in the backend too. This is how you can get HMR to work:
 *
 * import './foo/bar'
 * if (module.hot) {
 *   module.hot.accept('./foo/bar', (...stuff) => {
 *     console.log(require('./foo/bar'))
 *   })
 * }
 */
