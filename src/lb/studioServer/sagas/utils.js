// @flow
import {type Channel, eventChannel, END} from 'redux-saga'

export type Socket = $FlowFixMe
export type SocketServer = $FlowFixMe
export type ServerEvent = {type: 'connection', socket: Socket} | {type: 'error', error: $FlowFixMe}

export const getChannelFromSocketServer = (server: SocketServer): Channel => {
  return eventChannel((emitToChannel) => {
    server.on('connection', (socket) => {
      emitToChannel(({type: 'connection', socket}: ServerEvent))
    })

    server.on('error', (error) => {
      emitToChannel(({type: 'error', error}: ServerEvent))
    })

    const unsubscribe = () => {
    }

    return unsubscribe
  })
}

export type SocketHandshake = $FlowFixMe
export type Request = {handshake: SocketHandshake, type: 'request', endpoint: string, payload: mixed, respond: (payload: mixed) => void}

export type SocketEvent =
  {handshake: SocketHandshake, type: 'error', error: $FlowFixMe} |
  Request

export type ResponseToSocketRequest =
  {type: 'error', errorType: 'malformedRequest'} |
  mixed

export const getChannelFromSocket = (socket: Socket): Channel => {
  return eventChannel((emitToChannel) => {
    const errorListener = (error) => {
      emitToChannel(({type: 'error', error, handshake: socket.handshake}: SocketEvent))
    }
    socket.on('error', errorListener)

    const requestListener = (request: {endpoint: string, payload: mixed}, respond: Function) => {
      let endpoint, payload
      try {
        endpoint = request.endpoint
        payload = request.payload
      } catch (e) {
        respond(({type: 'error', errorType: 'malformedRequest'}: ResponseToSocketRequest))
        return
      }

      emitToChannel(({type: 'request', endpoint, payload, respond, handshake: socket.handshake}: SocketEvent))
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