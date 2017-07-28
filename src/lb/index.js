// @flow
import 'source-map-support/register'
import configureStore from '$lb/bootstrap/configureStore'

// @todo remove this?
(function(){
  if (module.hot) {
    module.hot.accept()
    if (global.__APP_ALREADY_RAN) {
      // $FlowIgnore
      process.exit()

    } else {
      global.__APP_ALREADY_RAN = true
    }
  }

  configureStore()
})()

/**
 * @note We can use HMR in the backend too. This is how you can get HMR to work:
 *
 * if (module.hot) {
 *   module.hot.accept()
 *   module.hot.accept('./foo/bar', (...stuff) => {
 *     console.log(require('./foo/bar'))
 *   });
 * }
 */