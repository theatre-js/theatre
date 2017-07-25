// @flow
import {channel} from 'redux-saga'
import {fork, call, take, cancel} from 'redux-saga/effects'
import createLauncherWindowsWhenNeeded from './createLauncherWindowsWhenNeeded'
import serveWindow from './serveWindow'

export default function* laucnherWindowSaga(): Generator<> {
  const windowEventsChannel = yield call(channel)
  yield fork(createLauncherWindowsWhenNeeded, windowEventsChannel)
  let lastServeWindowTask
  while (true) {
    const {type, payload} = yield take(windowEventsChannel)
    if (type === 'newWindow') {
      if (lastServeWindowTask)
        throw new Error('Got a new window when the old window is still open')

      lastServeWindowTask = yield fork(serveWindow, payload)
    } else if (type === 'windowClosed') {
      if (!lastServeWindowTask)
        throw new Error('Got a windowclosed event when there are no open windows')

      yield cancel(lastServeWindowTask)
      lastServeWindowTask = undefined
    }
  }
}