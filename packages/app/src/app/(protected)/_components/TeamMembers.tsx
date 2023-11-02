import {api} from '~/trpc/react'
import {Avatar, AvatarFallback, AvatarImage} from '~/ui/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/ui/components/ui/select'
import {Separator} from '~/ui/components/ui/separator'
import {Button} from '~/ui/components/ui/button'
import {useToast} from '~/ui/components/ui/use-toast'

export default function Members({teamId}: {teamId: string}) {
  const members = api.teams.getMembers.useQuery({id: teamId}).data!
  const removeMember = api.teams.removeMember.useMutation().mutateAsync
  const changeMemberRole = api.teams.changeMemberRole.useMutation().mutateAsync
  const queryUtils = api.useUtils()

  const {toast} = useToast()

  async function handleRemoveMember(email: string) {
    await removeMember({id: teamId, email})
    queryUtils.teams.getMembers.invalidate()
  }

  async function handleChangeRole(email: string, role: 'MEMBER' | 'OWNER') {
    try {
      await changeMemberRole({id: teamId, email, role})
      queryUtils.teams.getMembers.invalidate()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
      })
    }
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
