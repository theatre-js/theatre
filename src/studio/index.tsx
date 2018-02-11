if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  const globalHook = require('$root/vendor/react-devtools-backend/installGlobalHook')
  globalHook(window)
}
const backend = require('$root/vendor/react-devtools-backend/backend')
backend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import TheaterJSStudio from '$studio/bootstrap/TheaterJSStudio'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'

const theaterStudioInstance = new TheaterJSStudio()
theaterStudioInstance.run()

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.studio = theaterStudioInstance
}

const reactExport = {
  Root: createRootComponentForReact(theaterStudioInstance),
}
export {theaterStudioInstance as studio, reactExport as react}
