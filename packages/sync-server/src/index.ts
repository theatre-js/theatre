import {createContext} from './trpc'
import syncServerRouter from './trpc/routes'
import {applyWSSHandler} from '@trpc/server/adapters/ws'
import ws from 'ws'
import http from 'http'
import {env} from './env'

const HOST = env.HOST && env.HOST !== 'localhost' ? env.HOST : undefined

const server = http.createServer((req, res) => {
  const proto = req.headers['x-forwarded-proto']
  if (proto && proto === 'http') {
    // redirect to ssl
    res.writeHead(303, {
      location: `https://` + req.headers.host + (req.headers.url ?? ''),
    })
    res.end()
    return
  }
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'})
    res.end(
      'Sync server is running. Access via ws://' +
        env.HOST +
        ' (if on ssl, use wss://)',
    )
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'})
    res.end('Error 404: Page not found.')
  }
})

server.listen(parseInt(env.PORT), () => {
  console.log('✅ HTTP Server listening on ', env.HOST + ':' + env.PORT)
})

const wss = new ws.Server({server})
const handler = applyWSSHandler({wss, router: syncServerRouter, createContext})

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`)
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`)
  })
})
console.log('✅ WebSocket Server listening on ', env.HOST + ':' + env.PORT)

process.on('SIGTERM', () => {
  console.log('SIGTERM')
  handler.broadcastReconnectNotification()
  wss.close()
  server.close()
})
