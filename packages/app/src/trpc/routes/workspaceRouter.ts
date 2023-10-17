import {z} from 'zod'
import * as t from '../trpc'
import prisma from 'src/prisma'
import {TRPCError} from '@trpc/server'

export const workspaceRouter = t.createRouter({
  getAll: t.protectedProcedure
    .output(
      z.array(
        z
          .object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            isGuest: z.boolean(),
            accessLevel: z.string(),
          })
          .strict(),
      ),
    )
    .query(async ({ctx, input}) => {
      const {session} = ctx
      const userId = session.user.id

      const workspaces = await prisma.workspace.findMany({
        where: {
          OR: [
            {
              guests: {
                some: {
                  userId,
                },
              },
            },
            {
              team: {
                members: {
                  some: {
                    userId,
                  },
                },
              },
            },
          ],
        },
        include: {
          guests: {
            where: {
              userId,
            },
          },
        },
      })

      const clientData = workspaces.map((workspace) => {
        const isGuest = workspace.guests.some(
          (guest) => guest.userId === userId,
        )

        const filtered = {
          id: workspace.id,
          name: workspace.name,
          description: workspace.description,
          isGuest,
        }

        // If guest, they have the access level defined in the guest settings
        if (isGuest) {
          return {
            ...filtered,
            accessLevel: workspace.guests[0].accessLevel,
          }
        }

        // If not guest, they have read/write access because they are a team member
        return {
          ...filtered,
          accessLevel: 'READ_WRITE',
        }
      })

      return clientData
    }),
  create: t.protectedProcedure
    .input(
      z.object({name: z.string(), description: z.string(), teamId: z.string()}),
    )
    .output(z.object({id: z.string()}))
    .mutation(async (opts) => {
      const {name, description, teamId} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const team = await prisma.team.findUnique({
        where: {
          id: teamId,
        },
        select: {
          members: {
            where: {
              userId,
            },
          },
        },
      })

      // Only team members are allowed to create workspaces
      const createAllowed = team?.members.length !== 0

      if (!createAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      const workspace = await prisma.workspace.create({
        data: {
          name,
          description,
          teamId,
        },
      })

      return {id: workspace.id}
    }),

  update: t.protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async (opts) => {
      const {id, name, description} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          team: {
            select: {
              members: {
                where: {
                  userId,
                },
              },
            },
          },
          guests: {
            where: {
              userId,
            },
          },
        },
      })

      // Team members and guests with write access are allowed to edit workspaces
      const editAllowed =
        workspace?.team?.members.length !== 0 ||
        workspace?.guests[0]?.accessLevel === 'READ_WRITE'

      if (!editAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      await prisma.workspace.update({
        where: {
          id,
        },
        data: {
          name,
          description,
        },
      })
    }),
  delete: t.protectedProcedure
    .input(z.object({id: z.string()}))
    .mutation(async (opts) => {
      const {id} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          team: {
            select: {
              members: {
                where: {
                  userId,
                },
              },
            },
          },
          guests: {
            where: {
              userId,
            },
          },
        },
      })

      // Only team members are allowed to remove workspaces
      const deleteAllowed = workspace?.team?.members.length !== 0

      if (!deleteAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      await prisma.workspace.delete({
        where: {
          id,
        },
      })
    }),
  inviteGuests: t.protectedProcedure
    .input(
      z.object({
        id: z.string(),
        invites: z.array(
          z.object({
            email: z.string(),
            accessLevel: z.enum(['READ', 'READ_WRITE']),
          }),
        ),
      }),
    )
    .mutation(async (opts) => {
      const {id, invites} = opts.input
      const emails = invites.map((invite) => invite.email)
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          team: {
            select: {
              members: {
                where: {
                  userId,
                },
              },
            },
          },
          guests: {
            where: {
              userId,
            },
          },
        },
      })

      // Only team members are allowed to invite guests
      const inviteAllowed = workspace?.team?.members.length !== 0

      if (!inviteAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      // Make sure users exist
      const invitedUsers = await prisma.user.findMany({
        where: {
          email: {
            in: emails,
          },
        },
      })

      if (invitedUsers.length !== emails.length) {
        throw new TRPCError({code: 'BAD_REQUEST'})
      }

      // Create guest access records
      await prisma.workspace.update({
        where: {
          id,
        },
        data: {
          guests: {
            upsert: invites.map((invite) => {
              const invitedUser = invitedUsers.find(
                (user) => user.email === invite.email,
              )!

              return {
                where: {
                  userId_workspaceId: {
                    userId: invitedUser.id,
                    workspaceId: id,
                  },
                },
                create: {
                  user: {
                    connect: {
                      id: invitedUser.id,
                    },
                  },
                  accessLevel: invite.accessLevel,
                },
                update: {},
              }
            }),
          },
        },
      })
    }),
  removeGuest: t.protectedProcedure
    .input(z.object({id: z.string(), email: z.string()}))
    .mutation(async (opts) => {
      const {id, email} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          team: {
            select: {
              members: {
                where: {
                  userId,
                },
              },
            },
          },
          guests: {
            where: {
              userId,
            },
            select: {
              userId: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      })

      // Team members can remove guests, or the guest can remove themselves
      const removeAllowed =
        workspace?.team?.members.length !== 0 ||
        email === workspace?.guests[0]?.user.email

      if (!removeAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      const userToRemove = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      await prisma.guestAccess.delete({
        where: {
          userId_workspaceId: {
            userId: userToRemove?.id!,
            workspaceId: id,
          },
        },
      })
    }),
  changeGuestAccess: t.protectedProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string(),
        accessLevel: z.enum(['READ', 'READ_WRITE']),
      }),
    )
    .mutation(async (opts) => {
      const {id, email, accessLevel} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          team: {
            select: {
              members: {
                where: {
                  userId,
                },
              },
            },
          },
          guests: {
            where: {
              userId,
            },
            select: {
              userId: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      })

      // Team members can change guest access
      const changeAllowed = workspace?.team?.members.length !== 0

      if (!changeAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      const userToChange = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      await prisma.guestAccess.update({
        where: {
          userId_workspaceId: {
            userId: userToChange?.id!,
            workspaceId: id,
          },
        },
        data: {
          accessLevel,
        },
      })
    }),
  acceptInvite: t.protectedProcedure
    .input(z.object({id: z.string()}))
    .mutation(async (opts) => {
      const {id} = opts.input
      const {session} = opts.ctx
      const userId = session.user.id

      const workspace = await prisma.workspace.findUnique({
        where: {
          id,
        },
        select: {
          guests: {
            where: {
              userId,
            },
          },
        },
      })

      // Only invitees can accept invites
      const acceptAllowed = workspace?.guests.length !== 0

      if (!acceptAllowed) {
        throw new TRPCError({code: 'FORBIDDEN'})
      }

      await prisma.guestAccess.update({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: id,
          },
        },
        data: {
          accepted: true,
        },
      })
    }),
})
