// @flow
import {app, BrowserWindow} from 'electron'
import {type Channel, channel} from 'redux-saga'
import {call, take, fork, cancel, spawn} from 'redux-saga/effects'
import electronIsReadyPromise from '../utils/electronIsReadyPromise'
import installDevtoolsExtensions from '../utils/installDevtoolsExtensions'
import {channelFromEmitter, putToChannel, combineChannels} from '$shared/utils/sagas'

export function createWindow() {
  let win = new BrowserWindow({width: 1200, height: 920, show: false})
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(`http://localhost:${process.env.devSpecific.launcherFrontend.devServerPort}/`)
  } else {
    throw new Error("This line isn't implemented for production mode yet")
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  return win
}

export default function* createLauncherWindowsWhenNeeded(windowsChannel: Channel): Generator<> {
  const appActivateEvents =
    yield call(channelFromEmitter, app, ['activate', 'window-all-closed'])

  yield electronIsReadyPromise
  yield call(installDevtoolsExtensions)

  const allEventsChannel = yield call(channel)
  yield fork(combineChannels, allEventsChannel, appActivateEvents)

  let window, combinedEventsTask
  function* reinitWindow(): Generator<> {
    if (combinedEventsTask) {
      yield cancel(combinedEventsTask)
    }

    window = yield call(createWindow)
    combinedEventsTask = yield spawn(combineChannels, allEventsChannel, channelFromEmitter(window, ['closed']))
    yield putToChannel(windowsChannel, 'newWindow', window)
  }

  yield call(reinitWindow)

  while(true) {
    const {type} = yield take(allEventsChannel)
    if (type === 'closed') {
      yield call(putToChannel, windowsChannel, 'windowClosed', window)
    } else if (type === 'activate') {
      yield call(reinitWindow)
    } else if (type === 'window-all-closed') {
      // @todo think of something for when all windows are closed
    }
  }
}