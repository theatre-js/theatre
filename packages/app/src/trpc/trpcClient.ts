import {httpBatchLink} from '@trpc/client'
import {createTRPCNext} from '@trpc/next'
import superjson from 'superjson'
import type {AppTrpcRouter} from './routes/'

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return ''
  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpcClient = createTRPCNext<AppTrpcRouter>({
  config(opts) {
    return {
      links: [
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
        }),
      ],
      transformer: superjson,
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: false,
})
