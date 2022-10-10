import type {Server} from 'net'

export async function tryMultiplePorts(
  port: number,
  tries: number,
  server: Server,
): Promise<number> {
  let portToTry = port
  let firstError = null
  let lastError = null

  while (portToTry < port + tries) {
    try {
      await new Promise((res, rej) => {
        const onListening = () => (rm(), res(true))
        const onError = () => (rm(), rej())
        const rm = () => {
          server.off('error', onError)
          server.off('listening', onListening)
        }

        server
          .listen(portToTry)
          .on('listening', onListening)
          .on('error', onError)
      })

      firstError = null
      lastError = null
      break // found a working port
    } catch (err) {
      if (!firstError) firstError = err
      lastError = err
      portToTry += 1
    }
  }

  if (firstError) {
    console.error(firstError)
    console.error(lastError)
    throw new Error(
      `Failed to find port starting at ${port} with ${tries} tries.`,
    )
  }

  return portToTry
}
