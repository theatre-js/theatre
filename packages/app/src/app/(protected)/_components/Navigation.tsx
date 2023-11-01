'use client'

import {Suspense} from 'react'
import Link from 'next/link'
import {useSelectedLayoutSegments} from 'next/navigation'
import {api} from '~/trpc/react'
import {Button} from '~/ui/components/ui/button'
import {cn} from '~/ui/lib/utils'
import AccountSwitcher from './AccountSwitcher'
import NotificationsPopover from './NotificationsPopover'

export default function Navigation() {
  const teams = api.teams.getAll.useQuery().data!
  const segments = useSelectedLayoutSegments()
  const selected = segments[0] === 'team' ? segments[1] : segments[0]

  return (
    <div>
      <div className={cn('pb-12')}>
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-2">
              <Suspense>
                <AccountSwitcher />
              </Suspense>
              <div>
                <NotificationsPopover />
              </div>
            </div>

            <div className="space-y-1">
              <Link href="/recents">
                <Button
                  variant={selected === 'recents' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  Recents
                </Button>
              </Link>

              <Link href="/shared-with-me">
                <Button
                  variant={
                    selected === 'shared-with-me' ? 'secondary' : 'ghost'
                  }
                  className="w-full justify-start"
                >
                  Shared with me
                </Button>
              </Link>
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Teams
            </h2>
            <div className="space-y-1">
              {teams
                .filter((team) =>
                  team.members.some((member) => member.accepted),
                )
                .map((team) => (
                  <Link key={team.id} href={`/team/${team.id}`}>
                    <Button
                      variant={selected === team.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                    >
                      {team.name}
                    </Button>
                  </Link>
                  // <ContextMenu>
                  //   <ContextMenuTrigger>
                  //     <Link key={team.id} href={`/team/${team.id}`}>
                  //       <Button
                  //         variant={selected === team.id ? 'secondary' : 'ghost'}
                  //         className="w-full justify-start"
                  //       >
                  //         {team.name}
                  //       </Button>
                  //     </Link>
                  //   </ContextMenuTrigger>
                  //   <ContextMenuContent className="w-40">
                  //     <ContextMenuItem
                  //       onSelect={async () => {
                  //       }}
                  //     >
                  //       Rename
                  //     </ContextMenuItem>
                  //   </ContextMenuContent>
                  // </ContextMenu>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
