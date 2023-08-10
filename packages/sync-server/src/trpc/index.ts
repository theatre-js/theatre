import type * as trpc from '@trpc/server'
import {initTRPC} from '@trpc/server'
import type {IncomingMessage} from 'http'
import type {NodeHTTPCreateContextFnOptions} from '@trpc/server/adapters/node-http'
import superjson from 'superjson'
import type ws from 'ws'
import {ZodError} from 'zod'
import type {Session} from 'src/utils/authUtils'
import {verifyAccessTokenOrThrow} from 'src/utils/authUtils'

const t = initTRPC.context<ServerContext>().create({
  /**
   * @see https://trpc.io/docs/v10/data-transformers
   */
  transformer: superjson,
  /**
   * @see https://trpc.io/docs/v10/error-formatting
   */
  errorFormatter({shape, error}) {
    console.log(error)
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * Create a router
 * @see https://trpc.io/docs/v10/router
 */
export const createRouter = t.router

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const procedure = t.procedure

/**
 * @see https://trpc.io/docs/v10/middlewares
 */
export const middleware = t.middleware

/**
 * @see https://trpc.io/docs/v10/merging-routers
 */
export const mergeRouters = t.mergeRouters

type SyncServerTrpcContext = {
  requireValidSession: (opts: {
    input: {studioAuth: {accessToken: string}}
  }) => Promise<Session>
}
/**
 * Creates context for an incoming request
 * {@link https://trpc.io/docs/context}
 */

export const createContext = async (
  opts: NodeHTTPCreateContextFnOptions<IncomingMessage, ws>,
): Promise<SyncServerTrpcContext> => {
  let cashedResult: null | Promise<Session> = null

  return {
    async requireValidSession(opts): Promise<Session> {
      if (cashedResult) return cashedResult
      cashedResult = verifyAccessTokenOrThrow(opts)
      return cashedResult
    },
  }
}

export type ServerContext = trpc.inferAsyncReturnType<typeof createContext>
