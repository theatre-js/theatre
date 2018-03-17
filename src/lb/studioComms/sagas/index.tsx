import {
  getChannelOfConnectionsFromSocketServer,
  getChannelFromSocket,
  SocketServer,
  ServerEvent,
  Socket,
  SocketEvent,
  ShapeOfRequestFromStudio,
} from './utils'
import {fork, take, call} from 'redux-saga/effects'
import Server from 'socket.io'
import allStudioSocketEndpoints from './allStudioSocketEndpoints'
import wn from 'when'

const makeSocketServer = (): Promise<SocketServer> => {
  const deferred = wn.defer<SocketServer>()
  const server = new Server()
  server.listen(process.env.studio.socketPort, () => {})

  deferred.resolve(server)
  console.log('Studio server listening on', process.env.studio.socketPort)
  // @ts-ignore @ignore
  return deferred.promise
}

export default function* studioCommsRootSaga(): Generator_<
  $FixMe,
  $FixMe,
  $FixMe
> {
  const server = yield call(makeSocketServer)

  try {
    yield fork(handleServer, server)
    yield wn.defer().promise
  } finally {
    server.close()
  }
}

function* handleServer(
  server: SocketServer,
): Generator_<$FixMe, $FixMe, $FixMe> {
  const connectionsChannel = yield call(
    getChannelOfConnectionsFromSocketServer,
    server,
  )
  try {
    while (true) {
      const serverEvent: ServerEvent = yield take(connectionsChannel)
      if (serverEvent.type === 'error') {
        // @todo
        console.error(`Error from socket server`, serverEvent.error)
      } else {
        yield fork(handleConnection, serverEvent.socket)
      }
    }
  } finally {
    connectionsChannel.close()
  }
}

function* handleConnection(socket: Socket): Generator_<$FixMe, $FixMe, $FixMe> {
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

function* handleRequest(
  request: ShapeOfRequestFromStudio,
): Generator_<$FixMe, $FixMe, $FixMe> {
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
  } else {
    // @todo
    console.error(
      `Received a request from studio with an unkown handler: ` +
        String(request.type),
    )
  }
}
