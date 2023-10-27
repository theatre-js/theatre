import {z} from 'zod'
import {studioAuth} from 'src/utils/authUtils'
import {v4} from 'uuid'
import * as t from '../trpc'

export const projectsRouter = t.createRouter({
  create: t.publicProcedure
    .input(z.object({studioAuth: studioAuth.input}))
    .output(z.object({id: z.string()}))
    .mutation(async (opts) => {
      const s = await studioAuth.verifyStudioAccessTokenOrThrow(opts)
      const {userId} = s
      const id = v4() + '-' + v4()

      // await prisma.project.create({data: {id, userId, name: ''}})

      return {id}
    }),
})
