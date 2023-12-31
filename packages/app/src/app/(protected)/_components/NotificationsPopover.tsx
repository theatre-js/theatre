'use client'

import {Suspense} from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/ui/components/ui/popover'
import {Bell} from 'lucide-react'
import {Button} from '~/ui/components/ui/button'
import {api} from '~/trpc/react'

export default function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" className="w-[500px]">
        <h2 className="mb-5 text-lg font-semibold tracking-tight">
          Notifications
        </h2>
        <Suspense>
          <Invitations />
        </Suspense>
      </PopoverContent>
    </Popover>
  )
}

const Invitations = () => {
  const me = api.me.get.useQuery().data!
  const guestInvitations = api.me.getGuestInvitations.useQuery().data!
  const teamInvitations = api.me.getTeamInvitations.useQuery().data!
  const acceptTeamInvitation = api.teams.acceptInvite.useMutation().mutateAsync
  const acceptGuestInvitation =
    api.workspaces.acceptInvite.useMutation().mutateAsync
  const rejectTeamInvitation = api.teams.removeMember.useMutation().mutateAsync
  const rejectGuestInvitation =
    api.workspaces.removeGuest.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  return (
    <div className="flex flex-col gap-1">
      {guestInvitations.map((invitation) => (
        <div className="flex items-center justify-between space-x-4 gap-4">
          <div className="text-sm font-light leading-none flex-1">
            You have been invited to{' '}
            {invitation.accessLevel === 'READ' ? 'read' : 'edit'}{' '}
            <span className="text-sm font-bold">
              {invitation.workspaceName}
            </span>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={async () => {
                await acceptGuestInvitation({id: invitation.workspaceId})
                void queryUtils.me.getGuestInvitations.invalidate()
                void queryUtils.workspaces.invalidate()
              }}
              size="sm"
            >
              Accept
            </Button>
            <Button
              onClick={async () => {
                await rejectGuestInvitation({
                  id: invitation.workspaceId,
                  email: me.email!,
                })
                void queryUtils.me.getGuestInvitations.invalidate()
                void queryUtils.workspaces.invalidate()
              }}
              variant="ghost"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
      {teamInvitations.map((invitation) => (
        <div className="flex items-center justify-between space-x-4 gap-4">
          <div className="text-sm font-light leading-none flex-1">
            You have been invited to join{' '}
            <span className="text-sm font-bold">{invitation.teamName}</span>
          </div>
          <div className="flex gap-1">
            <Button
              onClick={async () => {
                await acceptTeamInvitation({id: invitation.teamId})
                void queryUtils.me.getTeamInvitations.invalidate()
                void queryUtils.teams.invalidate()
              }}
              size="sm"
            >
              Accept
            </Button>
            <Button
              onClick={async () => {
                await rejectTeamInvitation({
                  id: invitation.teamId,
                  email: me.email!,
                })
                void queryUtils.me.getTeamInvitations.invalidate()
                void queryUtils.teams.invalidate()
              }}
              variant="ghost"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
