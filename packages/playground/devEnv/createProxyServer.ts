import type {IncomingMessage, ServerResponse} from 'http'
import {createServer, request} from 'http'

// See example from https://esbuild.github.io/api/#customizing-server-behavior
export function createProxyServer(
  handleRequest:
    | ((req: IncomingMessage, res: ServerResponse) => boolean)
    | undefined,
  target: {hostname: string; port: number},
) {
  return createServer((req, res) => {
    const {url, method, headers} = req
    if (handleRequest?.(req, res)) {
      return
    }

    // Otherwise forward requests to target (e.g. ESBuild server)
    req.pipe(
      request(
        {
          ...target,
          path: url,
          method,
          headers,
        },
        (prxRes) => {
          res.writeHead(prxRes.statusCode!, prxRes.headers)
          prxRes.pipe(res, {end: true})
        },
      ),
      {end: true},
    )
  })
}
