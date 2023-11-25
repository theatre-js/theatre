import {studioAuthRouter} from './routes/studioAuthRouter'
import * as t from '../api/trpc'

export const studioTrpcRouter = t.createRouter({
  syncServerUrl: t.publicProcedure.query(() => `ws://localhost:3001/api/trpc`),
  studioAuth: studioAuthRouter,
})

export type StudioTRPCRouter = typeof studioTrpcRouter
