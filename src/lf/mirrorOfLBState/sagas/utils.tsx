// @flow
import {Channel,eventChannel} from 'redux-saga'
import generateUniqueId from 'uuid/v4'
import wn from 'when'
import {ipcRenderer} from 'electron'

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

export function sendRequestToMain(
  type: string,
  payload: mixed,
): Promise<mixed> {
  const request = {
    id: generateUniqueId(),
    type,
    payload,
  }

  const payloadDeferred = wn.defer()

  const listener = (event, response: Response) => {
    if (response.id === request.id) {
      ipcRenderer.removeListener('response', listener)
      payloadDeferred.resolve(response.payload)
    }
  }

  ipcRenderer.on('response', listener)
  ipcRenderer.send('request', request)

  return payloadDeferred.promise
}

export const getChannelOfRequestsFromMain = (): Channel => {
  return eventChannel(emitToChannel => {
    const listener = (event, request: Request) => {
      let alreadyResponded = false
      const respond = (payload: mixed) => {
        if (alreadyResponded)
          throw new Error(
            `Request '${request.id}' to '${
              request.type
            }' is already responded to`,
          )

        alreadyResponded = true
        ipcRenderer.send('response', {id: request.id, payload})
      }

      emitToChannel(
        ({
          type: request.type,
          payload: request.payload,
          respond,
        }: RequestFromWindow),
      )
    }

    ipcRenderer.on('request', listener)

    const unsubscribe = () => {
      ipcRenderer.removeListener('request', listener)
    }

    return unsubscribe
  })
}
