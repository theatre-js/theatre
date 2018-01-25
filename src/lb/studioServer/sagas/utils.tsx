// @flow
import {Channel,eventChannel, END} from 'redux-saga'

export type Socket = $FixMe
export type SocketServer = $FixMe
export type ServerEvent =
  | {type: 'connection', socket: Socket}
  | {type: 'error', error: $FixMe}

export const getChannelFromSocketServer = (server: SocketServer): Channel<$FixMe> => {
  return eventChannel(emitToChannel => {
    server.on('connection', socket => {
      emitToChannel(({type: 'connection', socket} as ServerEvent))
    })

    server.on('error', error => {
      emitToChannel(({type: 'error', error} as ServerEvent))
    })

    const unsubscribe = () => {}

    return unsubscribe
  })
}

export type SocketHandshake = $FixMe
export type Request = {
  handshake: SocketHandshake,
  type: 'request',
  endpoint: string,
  payload: mixed,
  respond: (payload: mixed) => void,
}

export type SocketEvent =
  | {handshake: SocketHandshake, type: 'error', error: $FixMe}
  | Request

export type ResponseToSocketRequest =
  | {type: 'error', errorType: 'malformedRequest'}
  | mixed

export const getChannelFromSocket = (socket: Socket): Channel<$FixMe> => {
  return eventChannel(emitToChannel => {
    const errorListener = error => {
      emitToChannel(
        ({type: 'error', error, handshake: socket.handshake} as SocketEvent),
      )
    }
    socket.on('error', errorListener)

    const requestListener = (
      request: {endpoint: string, payload: mixed},
      respond: Function,
    ) => {
      let endpoint, payload
      try {
        endpoint = request.endpoint
        payload = request.payload
      } catch (e) {
        respond(
          ({
            type: 'error',
            errorType: 'malformedRequest',
          } as ResponseToSocketRequest),
        )
        return
      }

      emitToChannel(
        ({
          type: 'request',
          endpoint,
          payload,
          respond,
          handshake: socket.handshake,
        } as SocketEvent),
      )
    }
    socket.on('request', requestListener)
    socket.on('disconnect', () => {
      emitToChannel(END)
    })

    const unsubscribe = () => {
      socket.removeListener('error', errorListener)
      socket.removeListener('request', requestListener)
    }

    return unsubscribe
  })
}
