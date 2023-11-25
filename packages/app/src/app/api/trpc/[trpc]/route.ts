import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import type {NextRequest} from 'next/server'
import {appRouter} from '~/server/api/root'
import {createTRPCContext} from '~/server/api/trpc'

// we don't need the trpc routes' responses to be cached
export const dynamic = 'force-dynamic'

const handler = async (req: NextRequest) => {
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

  return res
}

export {handler as GET, handler as POST, handler as OPTIONS}
