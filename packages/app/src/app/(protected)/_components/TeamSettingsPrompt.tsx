'use client'

import {type FC, Suspense} from 'react'
import {prompt} from 'react-promptify'
import {DialogHeader, DialogTitle} from '~/ui/components/ui/dialog'
import * as schemas from '~/schemas'
import {Button} from '~/ui/components/ui/button'
import {api} from '~/trpc/react'
import {promptValue} from '~/app/_components/Prompts'
import {toast} from '~/ui/components/ui/use-toast'
import {Avatar, AvatarFallback, AvatarImage} from '~/ui/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/ui/components/ui/select'
import {Separator} from '~/ui/components/ui/separator'

const TeamSettingsPrompt: FC<{id: string}> = ({id}) => {
  const team = api.teams.get.useQuery({id}).data!
  const updateTeam = api.teams.update.useMutation().mutateAsync
  const queryUtils = api.useUtils()

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
                queryUtils.teams.invalidate()
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
        <h4 className="text-sm font-medium">Members</h4>
        <Suspense fallback={<div>Loading...</div>}>
          <Members teamId={id} />
        </Suspense>
      </div>
    </>
  )
}

function Members({teamId}: {teamId: string}) {
  const members = api.teams.getMembers.useQuery({id: teamId}).data!
  const removeMember = api.teams.removeMember.useMutation().mutateAsync
  const changeMemberRole = api.teams.changeMemberRole.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  async function handleRemoveMember(email: string) {
    await removeMember({id: teamId, email})
    queryUtils.teams.getMembers.invalidate()
  }

  async function handleChangeRole(email: string, role: 'MEMBER' | 'OWNER') {
    await changeMemberRole({id: teamId, email, role})
    queryUtils.teams.getMembers.invalidate()
  }

  return (
    <div className="grid gap-6">
      {members.map((member) => (
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              {member.accepted ? (
                <>
                  <AvatarImage src={member.image ?? ''} />
                  <AvatarFallback>
                    {member.name!.split(/\s/).map((part) => part.charAt(0))}
                  </AvatarFallback>
                </>
              ) : (
                <>
                  <AvatarFallback className="border border-muted-foreground border-dashed bg-transparent" />
                </>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                {member.accepted ? member.name : 'Invitation pending...'}
              </p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>

          <Select
            value={member.role}
            onValueChange={(role) =>
              handleChangeRole(member.email, role as 'MEMBER' | 'OWNER')
            }
          >
            <SelectTrigger className="ml-auto w-[110px]">
              <SelectValue defaultValue={member.role} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full h-8 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemoveMember(member.email)}
              >
                Remove
              </Button>
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  )
}

export const promptTeamSettings = (id: string) =>
  prompt<null>(() => <TeamSettingsPrompt id={id} />)
