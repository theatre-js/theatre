// @flow
// import 'source-map-support/register'
import configureStore from '$lb/bootstrap/configureStore'

configureStore()

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