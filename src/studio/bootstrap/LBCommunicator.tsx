import wn from 'when'
import io from 'socket.io-client'

type Options = {
  backendUrl: string
}

type Socket = $FixMe

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
      return (this._socketPromise = createSocketPromsie(
        this.options.backendUrl,
      ))
    }
  }

  async request(endpoint: string, payload: mixed) {
    const socket = await this.getSocket()
    return emit('request', {endpoint, payload}, socket)
  }
}

const createSocketPromsie = (addr: string): Promise<Socket> => {
  const socket = io.connect(addr)
  const d = wn.defer<Socket>()

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

  socket.on('reconnect_failed', err => {
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
