import {createRouter, procedure} from '..'
import {z} from 'zod'
import {projectState} from './projectStateRouter'

const syncServerRouter = createRouter({
  healthcheck: procedure.input(z.object({})).query((props) => {
    return 'okay'
  }),

  projectState: projectState,
})

export type SyncServerRootRouter = typeof syncServerRouter

export default syncServerRouter
