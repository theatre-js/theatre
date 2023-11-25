import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import type {NextRequest} from 'next/server'
import {createTRPCContext} from '~/server/api/trpc'
import {studioTrpcRouter} from '~/server/studio-api/root'
import {allowCors} from '~/utils'

// we don't need the trpc routes' responses to be cached
export const dynamic = 'force-dynamic'

const handler = async (req: NextRequest) => {
  if (req.method === 'OPTIONS') {
    const res = new Response(null, {
      status: 204,
    })
    allowCors(res)
    return res
  }

  const res = await fetchRequestHandler({
    endpoint: '/api/studio-trpc',
    req,
    router: studioTrpcRouter,
    createContext: () => createTRPCContext(),
    onError:
      process.env.NODE_ENV === 'development'
        ? ({path, error}) => {
            console.error(
              `❌ studio-trpc failed on ${path ?? '<no-path>'}: ${
                error.message
              }`,
            )
          }
        : undefined,
  })

  allowCors(res)

  return res
}

export {handler as GET, handler as POST, handler as OPTIONS}
