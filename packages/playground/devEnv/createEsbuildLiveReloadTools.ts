import type esbuild from 'esbuild'
import type {IncomingMessage, ServerResponse} from 'http'

export function createEsbuildLiveReloadTools(): {
  handleRequest(req: IncomingMessage, res: ServerResponse): boolean
  hasOpenConnections(): boolean
  esbuildBanner: esbuild.BuildOptions['banner']
  esbuildWatch: esbuild.WatchMode
} {
  const openResponses = new Set<ServerResponse>()
  return {
    handleRequest(req, res) {
      // If special /esbuild url requested, subscribe clients to changes
      if (req.url === '/esbuild') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        })
        res.write('data: open\n\n')
        openResponses.add(res)
        res.on('close', () => openResponses.delete(res))
        return true // handled
      }
      return false
    },
    hasOpenConnections() {
      return openResponses.size > 0
    },
    esbuildBanner: {
      // Below uses function toString to insert raw source code of the function into the JS source.
      // This is being used so we can at least get a few type completions, but please understand that
      // you cannot reference any non-global browser values from within the function.
      js: `;(${function liveReloadClientSetup() {
        // from packages/playground/devEnv/createEsbuildLiveReloadTools.ts
        function connect() {
          if (window.parent !== window) {
            console.log(
              '%cLive reload disabled for iframed content',
              'color: gray',
            )
            return
          }
          try {
            const es = new EventSource('/esbuild')
            es.onmessage = (evt) => {
              switch (evt.data) {
                case 'reload':
                  location.reload()
                  break
                case 'open':
                  console.log('%cLive reload ready', 'color: gray')
                  break
              }
            }
            es.onerror = () => {
              es.close()
              attemptConnect()
            }
          } catch (err) {
            attemptConnect()
          }
        }
        function attemptConnect() {
          setTimeout(() => connect(), 1000)
        }
        attemptConnect()
      }.toString()})();`,
    },
    esbuildWatch: {
      onRebuild(error, res) {
        if (!error) {
          if (openResponses.size > 0) {
            console.error(`Reloading for ${openResponses.size} clients...`)
            // Notify clients on rebuild
            openResponses.forEach((res) => res.write('data: reload\n\n'))
            openResponses.clear()
          }
        } else {
          console.error('Rebuild had errors...')
        }
      },
    },
  }
}
