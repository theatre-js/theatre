import type {StudioTRPCRouter} from '@theatre/app/server/studio-api/root'
import type {CreateTRPCProxyClient} from '@trpc/client'
import {
  createTRPCProxyClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from '@trpc/client'
import superjson from 'superjson'

export default class AppLink {
  private _client!: CreateTRPCProxyClient<StudioTRPCRouter>

  constructor(private _webAppUrl: string) {
    if (process.env.NODE_ENV === 'test') return
    this._client = createTRPCProxyClient<StudioTRPCRouter>({
      links: [
        loggerLink({
          console: {
            log: (arg0, ...rest) => console.info('AppLink ' + arg0, ...rest),
            error: (arg0, ...rest) => console.error('AppLink ' + arg0, ...rest),
          },
          enabled: (opts) =>
            (process.env.NODE_ENV === 'development' &&
              typeof window !== 'undefined') ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: _webAppUrl + '/api/studio-trpc',
        }),
      ],
      transformer: superjson,
    })
  }

  get api() {
    return this._client
  }
}
