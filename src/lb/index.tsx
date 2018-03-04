import 'babel-polyfill'
import configureStore from '$lb/bootstrap/configureStore'

configureStore().runRootSaga()