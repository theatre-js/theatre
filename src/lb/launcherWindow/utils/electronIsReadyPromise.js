// @flow
import wn from 'when'
import {app} from 'electron'

function waitForElectron() {
  const d = wn.defer()
  app.on('ready', d.resolve)
  return d.promise
}

export default waitForElectron()