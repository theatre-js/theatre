import {fork, call, take, takeLatest, select} from 'redux-saga/effects'
import {delay, eventChannel, Channel} from 'redux-saga'
import electronIsReadyPromise from '$lb/lfController/utils/electronIsReadyPromise'
// import temporaryTrayIcon from '$lb/lfController/assets/temporaryTrayIcon.png'
import {BrowserWindow, ipcMain} from 'electron'
import deepEqual from 'deep-equal'
import allEndpointsForLF from './allEndpointsForLF'
import generateUniqueId from 'uuid/v4'
import wn from 'when'
import receiveNewState from '$src/lf/mirrorOfLBState/receiveNewState.caller'
import {defer} from '$shared/utils/defer'

type RawRequest = {
  type: string
  id: string
  payload: mixed
}

type Response = {
  id: string
  payload: mixed
}

export type Request = {
  type: string
  payload: mixed
  respond: (payload: mixed) => void
}

export const getChannelOfRequestsFromWindow = (
  // @ts-ignore @todo
  window: BrowserWindow,
): Channel<$FixMe> => {
  return eventChannel(emitToChannel => {
    const listener = (event: {sender: $FixMe}, request: RawRequest) => {
      if (event.sender !== window.webContents) {
        console.log('got st but not from this window')
        return
      }

      let alreadyResponded = false
      const respond = (payload: mixed) => {
        if (alreadyResponded)
          throw new Error(
            `Request '${request.id}' to '${
              request.type
            }' is already responded to`,
          )

        alreadyResponded = true
        event.sender.send('response', {id: request.id, payload})
      }

      emitToChannel({
        type: request.type,
        payload: request.payload,
        respond,
      } as Request)
    }

    ipcMain.on('request', listener)

    window.on('closed', () => {
      emitToChannel(END)
    })

    const unsubscribe = () => {
      ipcMain.removeListener('request', listener)
    }

    return unsubscribe
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 920,
    show: false,
    webPreferences: {webSecurity: false, allowRunningInsecureContent: true},
  })
  if ($env.NODE_ENV === 'development') {
    win.loadURL(`http://localhost:${$env.devSpecific.lf.devServerPort}/`)
  } else {
    // @todo
    throw new Error(
      `Implement a way to launch an lf window in production mode.`,
    )
  }

  win.once('ready-to-show', () => {
    win.show()
  })

  return win
}

function* sendStateUpdatesToWindow(
  window: typeof BrowserWindow,
): Generator_<$FixMe> {
  let lastState = yield select()
  yield takeLatest('*', function*(): Generator_<$FixMe> {
    yield delay(2)
    const newState = yield select()
    // @todo we don't really need to send all of the state to lf. Just the parts that lf needs
    if (!deepEqual(lastState, newState)) {
      try {
        yield call(receiveNewState, window, newState)
      } catch (e) {
        if (e !== 'timeout') {
          throw e
        }
      }
      lastState = newState
    }
  })
}

export default function* lfControllerSaga(): Generator_ {
  yield electronIsReadyPromise
  // const tray = new Tray(temporaryTrayIcon)
  const window = createWindow()
  window.show()

  try {
    yield fork(listenToWindowRequests, window)

    yield new Promise(resolve => {
      window.webContents.once('dom-ready', resolve)
    })
    // @ts-ignore
    yield fork(sendStateUpdatesToWindow, window)
    // @ts-ignore
    yield new Promise(() => {}) // just prevents the window from being closed right after it's open
  } finally {
    // tray.destroy()
    window.destroy()
  }
}

function* listenToWindowRequests(
  window: typeof BrowserWindow,
): Generator_<$FixMe> {
  const requestsFromWindow = yield call(getChannelOfRequestsFromWindow, window)

  while (true) {
    const request = yield take(requestsFromWindow)
    const endpointHandler = allEndpointsForLF[request.type]
    if (endpointHandler) {
      yield fork(handleRequestFromWindow, endpointHandler, request)
    } else {
      throw Error(`Unkown request type received from LB '${request.type}'`)
    }
  }
}

function* handleRequestFromWindow(
  handler: Function,
  request: Request,
): Generator_<$FixMe> {
  try {
    // @ts-ignore
    const result = yield call(handler, request.payload)
    request.respond(result)
    return
  } catch (e) {
    console.error(e) // @todo log this somewhere
    request.respond({type: 'error', errorType: 'unkown'})
    return
  }
}

/**
 * @note If you set the timeout arg to a big number (say 10000ms), then we'll have a memory leak caused
 * by having set up too many listeners on ipcMain.
 *
 * @note this is not supposed to be used directly. Use callerFromLBToLF instead.
 */
export function _sendRequestToWindow(
  // @ts-ignore @todo
  window: BrowserWindow,
  type: string,
  payload: mixed,
  timeout: number,
  thePromise: 'I promise this call is coming from callerFromLBToLF()',
): Promise<mixed> {
  if (thePromise !== 'I promise this call is coming from callerFromLBToLF()') {
    throw new Error(
      `_sendRequestToWindow() is only supposed to be called through \`callerFromLBToLF()\`.
      This ensures that all the calls to LF are properly typed. Look for any file 
      suffixed with '.caller.tsx' to see how this should work`,
    )
  }
  const request = {
    id: generateUniqueId(),
    type,
    payload,
  }

  // @todo implement a timeout
  const payloadDeferred = defer()
  let responded = false

  const listener = (_event: mixed, response: Response) => {
    console.log('listener called', response)

    if (response.id === request.id) {
      ipcMain.removeListener('response', listener)
      responded = true
      // @ts-ignore @todo
      payloadDeferred.resolve(response.payload)
    }
  }

  ipcMain.on('response', listener)
  window.webContents.send('request', request)

  // if the response doesn't come within the specified timeout period, then we'll remove
  // listneer from ipcMain, and reject with 'timeout' being the reason
  const timeoutAndGCPromise = wn(undefined)
    .delay(timeout)
    // @ts-ignore @todo
    .then(() => {
      if (!responded) {
        ipcMain.removeListener('response', listener)
        return wn.reject('timeout')
      }
    })

  // @ts-ignore
  return wn.race([payloadDeferred.promise, timeoutAndGCPromise])
}

// function* autoRetryOnTimeout(
//   callee: Function,
//   args: Array<mixed>,
//   numberOfRetries: number = 10,
// ): Generator_<$FixMe> {
//   let retries = -1
//   while (true) {
//     retries++
//     try {
//       // @ts-ignore
//       return yield call(callee, ...args)
//     } catch (e) {
//       if (e !== 'timeout') {
//         throw e
//       } else if (retries === numberOfRetries) {
//         throw e
//       }
//     }
//   }
// }
