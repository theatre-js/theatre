// @flow
if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  const globalHook = require('@ariaminaei/react-devtools-mirror/backend/installGlobalHook')
  globalHook(window)
}
const backend = require('@ariaminaei/react-devtools-mirror/backend/backend')
backend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import TheStudioClass from '$studio/TheStudioClass'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'

const theaterStudioInstance = new TheStudioClass()
theaterStudioInstance.run()

window.studio = theaterStudioInstance

const reactExport = {
  Root: createRootComponentForReact(theaterStudioInstance),
}
export {
  theaterStudioInstance as studio,
  reactExport as react,
}
