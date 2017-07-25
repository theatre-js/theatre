// @flow
import 'source-map-support/register'
import configureStore from '$lb/bootstrap/configureStore'

(function(){
  if (module.hot) {
    module.hot.accept()
    if (global.__APP_ALREADY_RAN) {
      process.exit()

    } else {
      global.__APP_ALREADY_RAN = true
    }
  }

  configureStore()
})()