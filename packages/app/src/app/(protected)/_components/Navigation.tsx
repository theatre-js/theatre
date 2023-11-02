'use client'

import {Suspense} from 'react'
import Link from 'next/link'
import {useSelectedLayoutSegments} from 'next/navigation'
import {api} from '~/trpc/react'
import {Button} from '~/ui/components/ui/button'
import {cn} from '~/ui/lib/utils'
import AccountSwitcher from './AccountSwitcher'
import NotificationsPopover from './NotificationsPopover'
import {Plus} from 'lucide-react'
import {promptValue} from '~/app/_components/Prompts'
import * as schemas from '~/schemas'
import {promptInviteMembers} from './InviteTeamMembersPrompt'

export default function Navigation() {
  const teams = api.teams.getAll.useQuery().data!
  const createTeam = api.teams.create.useMutation().mutateAsync
  const segments = useSelectedLayoutSegments()
  const selected = segments[0] === 'team' ? segments[1] : segments[0]
  const queryUtils = api.useUtils()

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
            <div className="flex gap-2 items-center group mb-2">
              <h2 className="pl-4 text-lg font-semibold tracking-tight">
                Teams
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="invisible group-hover:visible h-7 w-7"
                onClick={async () => {
                  const name = await promptValue.string('Create team', {
                    label: 'Team name',
                    schema: schemas.teamName,
                  })
                  if (!name) return
                  const {id} = await createTeam({name})
                  await promptInviteMembers(id)
                  queryUtils.teams.invalidate()
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
