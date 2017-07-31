// @flow
import {fork, call, take, takeLatest, select} from 'redux-saga/effects'
import {delay} from 'redux-saga'
import electronIsReadyPromise from '$lb/launcherWindow/utils/electronIsReadyPromise'
import temporaryTrayIcon from '$lb/launcherWindow/assets/temporaryTrayIcon.png'
import {Tray, BrowserWindow} from 'electron'
import deepEqual from 'deep-equal'
import {sendRequestToWindow, getChannelOfRequestsFromWindow} from './utils'
import {reduceState} from '$shared/utils'

function createWindow() {
  let win = new BrowserWindow({width: 1200, height: 920, show: false})
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(`http://localhost:${process.env.devSpecific.launcherFrontend.devServerPort}/`)
  } else {
    // @todo
    throw new Error(`Implement a way to launch an lf window in production mode.`)
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  return win
}

function* sendStateUpdatesToWindow(window: BrowserWindow): Generator<> {
  let lastState = yield select()
  yield takeLatest('*', function* (): Generator<> {
    yield delay(2)
    const newState = yield select()
    if (!deepEqual(lastState, newState)) {
      try {
        yield call(sendRequestToWindow, window, 'receiveNewState', newState, 500)
      } catch (e) {
        if (e !== 'timeout') {
          throw e
        }
      }
      lastState = newState
    }
  })
}

export default function* laucnherWindowSaga(): Generator<> {
  yield electronIsReadyPromise
  let tray = new Tray(temporaryTrayIcon)
  let window = createWindow()
  window.show()

  try {
    yield fork(sendStateUpdatesToWindow, window)
    yield fork(listenToWindowRequests, window)
    yield delay(400)
    yield reduceState(['projects', 'foo', 'bar'], () => 'alohamora')
    yield new Promise(() => {}) // just prevents the window from being closed right after it's open
  } finally {
    tray.destroy()
    window.destroy()
  }
}

function* listenToWindowRequests(window: BrowserWindow): Generator<> {
  const requestsFromWindow = yield call(getChannelOfRequestsFromWindow, window)

  while(true) {
    const request = yield take(requestsFromWindow)
    if (request.type === 'getCurrentState') {
      yield fork(handleGetCurrentState, request)
    } else {
      throw Error(`Unkown request type received from LB '${request.type}'`)
    }
  }
}

function* handleGetCurrentState(request): Generator<> {
  const state = yield select()
  request.respond(state)
}