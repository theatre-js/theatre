import {z} from 'zod'
import {createRouter, procedure} from '..'
import appClient from 'src/appClient'
import {getSaazBack} from 'src/saaz'
import {observable} from '@trpc/server/observable'

const studioAuth = z.object({
  accessToken: z.string(),
})

type Session = {
  _accessToken: string
}

export async function ensureSessionHasAccessToProject(
  session: Session,
  projectId: string,
) {
  const {canEdit} = await appClient.studioAuth.canIEditProject.query({
    studioAuth: {accessToken: session._accessToken},
    projectId,
  })
  return canEdit
}

export const projectState = createRouter({
  saaz_applyUpdates: procedure
    .input(z.object({dbName: z.string(), opts: z.any(), studioAuth}))
    .output(z.any())
    .mutation(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return getSaazBack(opts.input.dbName).applyUpdates(opts.input.opts)
    }),

  saaz_updatePresence: procedure
    .input(z.object({dbName: z.string(), opts: z.any(), studioAuth}))
    .output(z.any())
    .mutation(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return getSaazBack(opts.input.dbName).updatePresence(opts.input.opts)
    }),

  saaz_closePeer: procedure
    .input(
      z.object({
        dbName: z.string(),
        opts: z.object({peerId: z.string()}),
        studioAuth,
      }),
    )
    .output(z.any())
    .mutation(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return getSaazBack(opts.input.dbName).closePeer(opts.input.opts)
    }),

  saaz_getUpdatesSinceClock: procedure
    .input(z.object({dbName: z.string(), opts: z.any(), studioAuth}))
    .output(z.any())
    .query(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return getSaazBack(opts.input.dbName).getUpdatesSinceClock(
        opts.input.opts,
      )
    }),

  saaz_getLastIncorporatedPeerClock: procedure
    .input(
      z.object({
        dbName: z.string(),
        opts: z.object({peerId: z.string()}),
        studioAuth,
      }),
    )
    .output(z.any())
    .query(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return getSaazBack(opts.input.dbName).getLastIncorporatedPeerClock(
        opts.input.opts,
      )
    }),

  saaz_subscribe: procedure
    .input(z.object({dbName: z.string(), opts: z.any(), studioAuth}))
    .output(z.any())
    .subscription(async (opts) => {
      await opts.ctx.requireValidSession(opts)
      return observable<{}>((emit) => {
        const unsubPromise = getSaazBack(opts.input.dbName).subscribe(
          opts.input.opts,
          (s) => {
            emit.next(s)
          },
        )

        return () => {
          void unsubPromise.then((unsub) => unsub())
        }
      })
    }),
})
