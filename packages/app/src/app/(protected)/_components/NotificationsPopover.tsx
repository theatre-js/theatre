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
  const invitations = api.me.getGuestInvitations.useQuery().data!

  return (
    <div>
      {invitations.map((invitation) => (
        <div className="flex items-center justify-between space-x-4 gap-4">
          <div className="text-sm font-light leading-none flex-1">
            You have been invited to{' '}
            {invitation.accessLevel === 'READ' ? 'read' : 'edit'}{' '}
            <span className="text-sm font-bold">
              {invitation.workspaceName}
            </span>
          </div>
          <div className="flex gap-1">
            <Button size="sm">Accept</Button>
            <Button variant="ghost" size="sm">
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
