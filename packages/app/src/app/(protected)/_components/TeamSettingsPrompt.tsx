'use client'

import {type FC, Suspense} from 'react'
import type {PromptProps} from '~/app/_components/Prompts';
import { confirm, prompt} from '~/app/_components/Prompts'
import {DialogHeader, DialogTitle} from '~/ui/components/ui/dialog'
import * as schemas from '~/schemas'
import {Button} from '~/ui/components/ui/button'
import {api} from '~/trpc/react'
import {promptValue} from '~/app/_components/Prompts'
import {toast} from '~/ui/components/ui/use-toast'
import {Separator} from '~/ui/components/ui/separator'
import Members from './TeamMembers'
import {promptInviteMembers} from './InviteTeamMembersPrompt'
import {useRouter} from 'next/navigation'

const TeamSettingsPrompt: FC<{id: string} & PromptProps<null>> = ({
  id,
  done,
}) => {
  const team = api.teams.get.useQuery({id}).data!
  const updateTeam = api.teams.update.useMutation().mutateAsync
  const deleteTeam = api.teams.delete.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  const router = useRouter()

  return (
    <>
      <DialogHeader>
        <DialogTitle>Team Settings</DialogTitle>
      </DialogHeader>
      <div>
        <div className="font-bold">Team name</div>
        <div className="flex items-center">
          <div className="text-sm">{team.name}</div>
          <Button
            variant="link"
            className="text-blue-500"
            onClick={async () => {
              const name = await promptValue.string(`Rename ${team.name}`, {
                defaultValue: team.name,
                schema: schemas.teamName,
              })

              if (!name) return

              try {
                await updateTeam({
                  id,
                  name,
                })
                void queryUtils.teams.invalidate()
              } catch (err) {
                toast({
                  variant: 'destructive',
                  title: 'Uh oh! Something went wrong.',
                  description: "Couldn't update team name.",
                })
              }
            }}
          >
            Edit
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-4">
        <div className="flex items-center">
          <h4 className="text-sm font-medium">Members</h4>
          <Button
            variant="link"
            className="text-blue-500"
            onClick={async () => {
              void promptInviteMembers(id)
            }}
          >
            Invite
          </Button>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <Members teamId={id} />
        </Suspense>
      </div>
      <Separator className="my-4" />
      <Button
        variant="destructive"
        onClick={async () => {
          const response = await confirm(
            `Are you sure you want to delete ${team.name}?`,
            "Deleting a team will delete all of the team's workspaces and cannot be undone.",
          )

          if (!response) return

          try {
            await deleteTeam({id, safety: `delete ${team.name}`})
            done(null)
            router.replace('/')
          } catch (err) {
            toast({
              variant: 'destructive',
              title: 'Uh oh! Something went wrong.',
              description: "Couldn't delete team.",
            })
          }
        }}
      >
        Delete {team.name}
      </Button>
    </>
  )
}

export const promptTeamSettings = (id: string) =>
  prompt<null>((done) => <TeamSettingsPrompt id={id} done={done} />)
