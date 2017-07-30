// @flow
import {type Channel, eventChannel, END} from 'redux-saga'
import generateUniqueId from 'uuid/v4'
import wn from 'when'
import {typeof BrowserWindow, ipcMain} from 'electron'

type Request = {
  type: string,
  id: string,
  payload: mixed,
}

type Response = {
  id: string,
  payload: mixed,
}

type RequestFromWindow = {
  type: string,
  payload: mixed,
  respond: (payload: mixed) => void,
}

export function sendRequestToWindow(window: BrowserWindow, type: string, payload: mixed): Promise<mixed> {
  const request = {
    id: generateUniqueId(),
    type, payload,
  }

  // @todo implement a timeout
  const payloadDeferred = wn.defer()

  const listener = (event, response: Response) => {
    if (event.sender === window.webContents && response.id === request.id) {
      ipcMain.removeListener('response', listener)
      payloadDeferred.resolve(response.payload)
    }
  }

  ipcMain.on('response', listener)
  window.webContents.send('request', request)

  return payloadDeferred.promise
}

export const getChannelOfRequestsFromWindow = (window: BrowserWindow): Channel => {
  return eventChannel((emitToChannel) => {
    const listener = (event, request: Request) => {
      if (event.sender !== window.webContents) {
        console.log('got st but not from this window')
        return
      }

      let alreadyResponded = false
      const respond = (payload: mixed) => {
        if (alreadyResponded)
          throw new Error(`Request '${request.id}' to '${request.type}' is already responded to`)

        alreadyResponded = true
        event.sender.send('response', {id: request.id, payload})
      }

      emitToChannel(({
        type: request.type,
        payload: request.payload,
        respond,
      }: RequestFromWindow))
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