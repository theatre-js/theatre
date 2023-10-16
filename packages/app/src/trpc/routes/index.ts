import {z} from 'zod'
import {studioAuthRouter} from './studioAuthRouter'
import * as t from '../trpc'
import {projectsRouter} from './projectsRouter'
import {workspaceRouter} from './workspaceRouter'
import {teamsRouter} from './teamsRouter'

export const appRouter = t.createRouter({
  healthCheck: t.publicProcedure
    // This is the input schema of your procedure
    // 💡 Tip: Try changing this and see type errors on the client straight away
    .input(
      z.object({
        name: z.string().nullish(),
      }),
    )
    .output(z.string())
    .query(({input}) => {
      // This is what you're returning to your client
      return 'This response is coming from app/lib-app-trpc'
    }),
  syncServerUrl: t.publicProcedure.query(() => `ws://localhost:3001/api/trpc`),
  studioAuth: studioAuthRouter,
  projects: projectsRouter,
  workspaces: workspaceRouter,
  teams: teamsRouter,
})
// export only the type definition of the API
// None of the actual implementation is exposed to the client

export type AppTrpcRouter = typeof appRouter
