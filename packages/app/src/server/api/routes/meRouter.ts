import {z} from 'zod'
import * as t from '../trpc'
import prisma from 'src/prisma'

export const meRouter = t.createRouter({
  get: t.protectedProcedure
    .output(
      z
        .object({
          id: z.string(),
          email: z.string().nullable(),
          name: z.string().nullable(),
          image: z.string().nullable(),
        })
        .strict(),
    )
    .query(async ({ctx, input}) => {
      const {session} = ctx
      const user = session.user

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }
    }),
  update: t.protectedProcedure
    .input(
      z
        .object({
          email: z.string().email(),
          name: z.string(),
          image: z.string().url(),
        })
        .partial(),
    )
    .mutation(async ({ctx, input}) => {
      const {session} = ctx
      const user = session.user

      const updatedUser = await prisma.user.update({
        where: {id: user.id},
        data: {
          email: input.email,
          name: input.name,
          image: input.image,
        },
      })
    }),
  delete: t.protectedProcedure
    .input(z.object({justToBeSure: z.literal('DELETE')}))
    .mutation(async ({ctx}) => {
      const {session} = ctx
      const user = session.user

      await prisma.$transaction([
        // Delete all teams that are left empty after the user is deleted
        prisma.team.deleteMany({
          where: {
            members: {
              every: {
                userId: user.id,
              },
            },
          },
        }),
        prisma.user.delete({
          where: {id: user.id},
        }),
      ])
    }),
  getGuestInvitations: t.protectedProcedure.query(async ({ctx}) => {
    const {session} = ctx
    const user = session.user

    const guestInvitations = await prisma.guestAccess.findMany({
      where: {
        userId: user.id,
        accepted: false,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return guestInvitations.map((guestInvitation) => ({
      workspaceId: guestInvitation.workspaceId,
      workspaceName: guestInvitation.workspace.name,
      accessLevel: guestInvitation.accessLevel,
    }))
  }),
  getTeamInvitations: t.protectedProcedure.query(async ({ctx}) => {
    const {session} = ctx
    const user = session.user

    const teamInvitations = await prisma.teamMember.findMany({
      where: {
        userId: user.id,
        accepted: false,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return teamInvitations.map((teamInvitation) => ({
      teamId: teamInvitation.teamId,
      teamName: teamInvitation.team.name,
      role: teamInvitation.userRole,
    }))
  }),
})
