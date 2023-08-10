import type {AppTrpcRouter} from '@theatre/app/trpc/routes'
import type {CreateTRPCProxyClient} from '@trpc/client'
import {createTRPCProxyClient, httpBatchLink} from '@trpc/client'
import superjson from 'superjson'

export default class AppLink {
  private _client!: CreateTRPCProxyClient<AppTrpcRouter>

  constructor(private _webAppUrl: string) {
    this._client = createTRPCProxyClient<AppTrpcRouter>({
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

    if (process.env.NODE_ENV === 'development') {
      void this._client.healthCheck.query({name: 'the lib'}).then((res) => {
        console.log('app/healthCheck', res)
      })
    }
  }

  get api() {
    return this._client
  }
}
