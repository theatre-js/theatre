import type {AppRouter} from '@theatre/app/src/server/api/root'
import {createTRPCProxyClient, httpBatchLink} from '@trpc/client'
import superjson from 'superjson'
import {env} from './env'

export let appHost = env.APP_URL
// if host does not start with a protocol:
if (!appHost.startsWith('http')) {
  // then assume it's https
  appHost = 'https://' + appHost
}

const appClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: appHost + '/api/trpc',
    }),
  ],
  transformer: superjson,
})

// if (process.env.NODE_ENV === 'development') {
//   void appClient..query({name: 'the lib'}).then((res) => {
//     console.log('app/healthCheck', res)
//   })
// }

export default appClient
