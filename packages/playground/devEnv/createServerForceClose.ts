import type {Server, Socket} from 'net'

export function createServerForceClose(server: Server) {
  const openConnections = new Set<Socket>()
  server.on('connection', (conn) => {
    openConnections.add(conn)
    conn.on('close', () => openConnections.delete(conn))
  })

  return function serverForceClose(): Promise<void> {
    for (const openConnection of openConnections) {
      openConnection.destroy()
    }

    return new Promise((res) => {
      server.close(() => {
        res()
      })
    })
  }
}
