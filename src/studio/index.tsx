if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  const globalHook = require('$root/vendor/react-devtools-backend/installGlobalHook')
  globalHook(window)
}
const backend = require('$root/vendor/react-devtools-backend/backend')
backend(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)

// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import Studio from '$studio/bootstrap/Studio'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'
import '$shared/DataVerse/devtoolsFormatters/setup'

const studio = new Studio()
// theaterStudioInstance.run()

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.studio = studio
}

const reactExport = {
  Root: createRootComponentForReact(studio),
}

const run = studio.run.bind(studio)

export {studio, reactExport as react, run}
