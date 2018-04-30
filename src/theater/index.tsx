// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import '$theater/integrations/react/treeMirroring/setup'

import Theater from '$theater/bootstrap/Theater'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'
import '$shared/DataVerse/devtoolsFormatters/setup'

const theater = new Theater({withStudio: true})
// theaterStudioInstance.run()

if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.theater = theater
}

const reactExport = {
  Root: createRootComponentForReact(theater),
}

const run = theater.run.bind(theater)

export {theater, reactExport as react, run}