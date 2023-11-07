'use client'

import * as React from 'react'
import {signOut} from 'next-auth/react'
import {CaretSortIcon} from '@radix-ui/react-icons'

import {cn} from '~/ui/lib/utils'
import {Avatar, AvatarFallback, AvatarImage} from '~/ui/components/ui/avatar'
import {Button} from '~/ui/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/ui/components/ui/popover'
import {api} from '~/trpc/react'
import {promptAccountSettings} from './AccountSettingsPrompt'

export default function AccountSwitcher() {
  const [open, setOpen] = React.useState(false)

  const user = api.me.get.useQuery().data

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn('w-[200px] justify-between')}
        >
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage src={user?.image ?? ''} />
            <AvatarFallback>
              {user?.name?.split(/\s/).map((part) => part.charAt(0))}
            </AvatarFallback>
          </Avatar>
          {user?.name}
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-[200px] p-2 flex-col">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => promptAccountSettings()}
        >
          Account settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() =>
            signOut({
              callbackUrl: '/',
            })
          }
        >
          Sign out
        </Button>
      </PopoverContent>
    </Popover>
  )
}
