import * as trpcNext from '@trpc/server/adapters/next'
import type {NextApiRequest, NextApiResponse} from 'next'
import {appRouter} from 'src/trpc/routes'
import {createTRPCContext} from 'src/trpc/trpc'

const trpcApiHandler = trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({path, error}: any) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
          )
        }
      : undefined,
})

// export API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Since these endpoints are for @theatre/studio as a library that can be used on any origin,
  // we must allow CORS requests from any origin.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Request-Method', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  // finally pass the request on to the tRPC handler
  await trpcApiHandler(req, res)
}
