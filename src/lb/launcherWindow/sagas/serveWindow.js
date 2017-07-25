// @flow
import {BrowserWindow} from 'electron'

export default function* serveWindow(window: BrowserWindow): Generator<> {
  console.log('serving', window.webContents)
}