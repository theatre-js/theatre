// @flow
if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  require('react-render-hook')
}
// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import TheStudioClass from '$studio/TheStudioClass'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'

const theaterStudioInstance = new TheStudioClass()
theaterStudioInstance.run()

window.studio = theaterStudioInstance

module.exports = {
  studio: theaterStudioInstance,
  react: {
    Root: createRootComponentForReact(theaterStudioInstance),
  },
}