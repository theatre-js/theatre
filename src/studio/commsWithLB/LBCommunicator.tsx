import io from 'socket.io-client'
import {defer} from '$shared/utils/defer'

type Options = {
  lbUrl: string
}

type Socket = $FixMe

type ThePromise = "I promise I'm calling LBCommunicator._request from wrapLBEndpointForStudio"
export const _correctText: ThePromise = `I promise I'm calling LBCommunicator._request from wrapLBEndpointForStudio`

export type RequestFn = (
  endpoint: string,
  payload: mixed,
  thePromise: ThePromise,
) => Promise<mixed>

export default class LBCommunicator {
  options: Options
  _socketPromise: null | Promise<$FixMe>

  constructor(options: Options) {
    this.options = options
    this._socketPromise = null
  }

  getSocket() {
    if (this._socketPromise) {
      return this._socketPromise
    } else {
      // return (this._socketPromise = createSocketPromsie(this.options.lbUrl, {
      //   transports: ['websocket'],
      // }))
    }
  }

  request<T>(fn: (request: RequestFn) => Promise<T>): Promise<T> {
    return fn(this._request)
  }

  _request = async (
    endpoint: string,
    payload: mixed,
    theCheck: ThePromise,
  ): Promise<mixed> => {
    if (theCheck !== _correctText) {
      throw new Error(
        `LBCommunicator._request should only be called through wrapLBEndpointForStudio`,
      ) // @todo
    }
    const socket = await this.getSocket()
    return emit('request', {endpoint, payload}, socket)
  }
}

const createSocketPromsie = (
  addr: string,
  opts: SocketIOClient.ConnectOpts,
): Promise<Socket> => {
  const socket = io.connect(
    addr,
    opts,
  )
  const d = defer<Socket>()

  let resolved = false
  socket.on('connect', () => {
    if (!resolved) {
      d.resolve(socket)
      resolved = false
    } else {
      console.error(
        "got 'socket:connect' when we're already connected. This shouldn't happen",
      )
    }
  })

  socket.on('reconnect_failed', (err: $FixMe) => {
    console.error(err)
    // @todo handle this case
    d.reject("Couldn't connect to socket server")
  })

  return d.promise
}

const emit = (
  eventName: string,
  data: mixed,
  socket: Socket,
): Promise<mixed> => {
  return new Promise(resolve => {
    socket.emit(eventName, data, (response: mixed) => {
      resolve(response)
    })
  })
}
