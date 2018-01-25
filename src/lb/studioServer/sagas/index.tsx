// @flow
import {
  getChannelFromSocketServer,
  getChannelFromSocket,
  SocketServer,
  ServerEvent,
  Socket,
  SocketEvent,
  Request,
} from './utils'
import {fork, take, call} from 'redux-saga/effects'
import Server from 'socket.io'
import allStudioSocketEndpoints from './allStudioSocketEndpoints'
import wn from 'when'

const makeSocketServer = (): Promise<SocketServer> => {
  const deferred = wn.defer()
  const server = new Server()
  server.listen(process.env.studio.socketPort, () => {})

  deferred.resolve(server)
  console.log('server listening on', process.env.studio.socketPort)
  return deferred.promise
}

export default function* studioServerRootSaga(): Generator_<*, *, *> {
  const server = yield call(makeSocketServer)

  try {
    yield fork(handleServer, server)
    yield wn.defer().promise
  } finally {
    server.close()
  }
}

function* handleServer(server: SocketServer): Generator_<*, *, *> {
  const eventsChannel = yield call(getChannelFromSocketServer, server)
  try {
    while (true) {
      const serverEvent: ServerEvent = yield take(eventsChannel)
      if (serverEvent.type === 'error') {
        // @todo
        console.error(`Error from socket server`, serverEvent.error)
      } else {
        yield fork(handleSocket, serverEvent.socket)
      }
    }
  } finally {
    eventsChannel.close()
  }
}

function* handleSocket(socket: Socket): Generator_<*, *, *> {
  const socketChannel = yield call(getChannelFromSocket, socket)

  try {
    while (true) {
      const socketEvent: SocketEvent = yield take(socketChannel)
      if (socketEvent.type === 'error') {
        // @todo
        console.error(`Error from socket`, socketEvent.error)
      } else {
        yield fork(handleRequest, socketEvent)
      }
    }
  } finally {
    socketChannel.close()
  }
}

function* handleRequest(request: Request): Generator_<*, *, *> {
  const handler = allStudioSocketEndpoints[request.endpoint]
  console.log('request', request.type, request.endpoint)
  if (handler) {
    try {
      const result = yield call(handler, request)
      request.respond(result)
      return
    } catch (e) {
      console.error(e) // @todo log this somewhere
      request.respond({type: 'error', errorType: 'unkown'})
      return
    }
  }
}
