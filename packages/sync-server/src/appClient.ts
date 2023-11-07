import type {AppTrpcRouter} from '@theatre/app/src/server/trpc/routes'
import {createTRPCProxyClient, httpBatchLink} from '@trpc/client'
import superjson from 'superjson'

export let appHost = process.env.APP_URL
// if host does not start with a protocol:
if (!appHost.startsWith('http')) {
  // then assume it's https
  appHost = 'https://' + appHost
}

const appClient = createTRPCProxyClient<AppTrpcRouter>({
  links: [
    httpBatchLink({
      url: appHost + '/api/trpc',
    }),
  ],
  transformer: superjson,
})

if (process.env.NODE_ENV === 'development') {
  void appClient.healthCheck.query({name: 'the lib'}).then((res) => {
    console.log('app/healthCheck', res)
  })
}

export default appClient
