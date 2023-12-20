import type {SyncServerRootRouter} from '@theatre/sync-server/trpc/routes'
import superjson from 'superjson'
import type {CreateTRPCProxyClient} from '@trpc/client'
import {
  createTRPCProxyClient,
  createWSClient,
  loggerLink,
  wsLink,
} from '@trpc/client'

export default class SyncServerLink {
  private _client: CreateTRPCProxyClient<SyncServerRootRouter>

  constructor(private _url: string) {
    const wsClient = createWSClient({
      url: _url,
    })

    this._client = createTRPCProxyClient<SyncServerRootRouter>({
      links: [
        loggerLink({
          console: {
            log: (arg0, ...rest) =>
              console.info('SyncServerLink ' + arg0, ...rest),
            error: (arg0, ...rest) =>
              console.error('SyncServerLink ' + arg0, ...rest),
          },
          enabled: (opts) =>
            (process.env.NODE_ENV === 'development' &&
              typeof window !== 'undefined') ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        wsLink({client: wsClient}),
      ],
      transformer: superjson,
    })

    if (process.env.NODE_ENV === 'development') {
      void this._client.healthcheck.query({}).then((res) => {
        console.log('syncServer/healthCheck', res)
      })
    }
  }

  get api(): CreateTRPCProxyClient<SyncServerRootRouter> {
    return this._client
  }
}
