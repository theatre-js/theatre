// @flow
// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill

import 'babel-polyfill'
import TheStudioClass from '$studio/TheStudioClass'
import createRootForReact from './componentModel/react/createRootForReact'

const theaterStudioInstance = new TheStudioClass()
theaterStudioInstance.run()

module.exports = {
  studio: theaterStudioInstance,
  react: {
    Root: createRootForReact(theaterStudioInstance._store.reduxStore),
  },
}