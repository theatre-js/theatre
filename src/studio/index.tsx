// @todo only one instance of babel-polyfill is allowed per window, so we can't ship
// with this global polyfill
import 'babel-polyfill'
import '$studio/integrations/react/treeMirroring/setup'

import Theatre from '$studio/bootstrap/Theatre'
import createRootComponentForReact from './componentModel/react/createRootComponentForReact'
import '$shared/DataVerse/devtoolsFormatters/setup'
import TheatreStudio from '$studio/bootstrap/TheatreStudio'

// debugger
const theatre = new Theatre({})
const studio = new TheatreStudio(theatre)
// debugger
theatre._setStudio(studio)
// studioStudioInstance.run()

if ($env.NODE_ENV === 'development') {
  // @ts-ignore
  window.studio = studio
}

const reactExport = {
  Root: createRootComponentForReact(theatre),
}

const run = theatre.run.bind(theatre)

export {theatre, reactExport as react, run}
