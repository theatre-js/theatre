import * as t from './trpc'
import {projectsRouter} from './routes/projectsRouter'
import {workspaceRouter} from './routes/workspaceRouter'
import {teamsRouter} from './routes/teamsRouter'
import {meRouter} from './routes/meRouter'

export const appRouter = t.createRouter({
  projects: projectsRouter,
  workspaces: workspaceRouter,
  teams: teamsRouter,
  me: meRouter,
})

export type AppRouter = typeof appRouter
