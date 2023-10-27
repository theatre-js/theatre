import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {type NextRequest} from 'next/server'

import {appRouter} from '~/server/api/root'
import {createTRPCContext} from '~/server/api/trpc'

const handler = async (req: NextRequest) => {
  // Since these endpoints are for @theatre/studio as a library that can be used on any origin,
  // we must allow CORS requests from any origin.
  if (req.method === 'OPTIONS') {
    return new Response()
  }

  const res = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({path, error}) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
            )
          }
        : undefined,
  })

  res.headers.set('Access-Control-Allow-Origin', '*')
  res.headers.set('Access-Control-Request-Method', '*')
  res.headers.set('Access-Control-Allow-Methods', '*')
  res.headers.set('Access-Control-Allow-Headers', '*')

  return res
}

export {handler as GET, handler as POST}
