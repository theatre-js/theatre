// @flow
// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import TheStudioClass from '$studio/TheStudioClass'

const theaterStudioInstance = new TheStudioClass()
theaterStudioInstance.run()

module.exports = theaterStudioInstance