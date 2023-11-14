import type {AppRouter} from '@theatre/app/server/api/root'
import type {CreateTRPCProxyClient} from '@trpc/client'
import {createTRPCProxyClient, httpBatchLink} from '@trpc/client'
import superjson from 'superjson'

export default class AppLink {
  private _client!: CreateTRPCProxyClient<AppRouter>

  constructor(private _webAppUrl: string) {
    if (process.env.NODE_ENV === 'test') return
    this._client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: _webAppUrl + '/api/trpc',
          async headers() {
            return {
              // authorization: getAuthCookie(),
            }
          },
        }),
      ],
      transformer: superjson,
    })
  }

  get api() {
    return this._client
  }
}
