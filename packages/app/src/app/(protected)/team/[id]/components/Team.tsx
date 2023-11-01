'use client'

import {useState} from 'react'
import WorkspaceThumb from '~/app/(protected)/_components/WorkspaceThumb'
import {api} from '~/trpc/react'
import NewWorkspaceDialog from '~/app/(protected)/_components/NewWorkspaceDialog'
import EditWorkspaceDialog from '~/app/(protected)/_components/EditWorkspaceDialog'
import {useToast} from '~/ui/components/ui/use-toast'
import InviteGuestsDialog from '~/app/(protected)/_components/InviteGuestsDialog'
import {Button} from '~/ui/components/ui/button'
import {Settings} from 'lucide-react'
import {promptTeamSettings} from '~/app/(protected)/_components/TeamSettingsPrompt'

export default function Team({id}: {id: string}) {
  const {data: team} = api.teams.get.useQuery({id})
  const me = api.me.get.useQuery().data!
  const {mutateAsync: deleteWorkspace} = api.workspaces.delete.useMutation()
  const {mutateAsync: duplicateWorkspace} =
    api.workspaces.duplicate.useMutation()
  const queryUtils = api.useUtils()
  const workspaces = team?.workspaces
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null)
  const [invitingGuests, setInvitingGuests] = useState<string | null>(null)

  const isOwner =
    team?.members.find((member) => member.id === me.id)?.role === 'OWNER'

  const {toast} = useToast()

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center group">
          <h2 className="text-2xl font-semibold tracking-tight">
            {team?.name}
          </h2>
          {isOwner && (
            <Button
              variant="outline"
              size="icon"
              className="invisible group-hover:visible"
              onClick={() => {
                promptTeamSettings(id)
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div>
          <NewWorkspaceDialog teamId={team!.id} />
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 w-full">
        {workspaces?.map((workspace) => (
          <>
            <WorkspaceThumb
              key={workspace.id}
              name={workspace.name}
              description={workspace.description}
              // thumbnail={workspace.thumbnail}
              thumbnail="/butterfly.png"
              allowEdit={true}
              onDelete={async () => {
                await deleteWorkspace({id: workspace.id})
                queryUtils.teams.invalidate()
                queryUtils.workspaces.invalidate()
              }}
              onEdit={() => setEditingWorkspace(workspace.id)}
              onDuplicate={async () => {
                try {
                  await duplicateWorkspace({id: workspace.id})
                  queryUtils.teams.invalidate()
                  queryUtils.workspaces.invalidate()
                } catch (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description: "Couldn't duplicate the workspace.",
                  })
                }
              }}
              onInvite={() => setInvitingGuests(workspace.id)}
            />
            <EditWorkspaceDialog
              open={editingWorkspace === workspace.id}
              workspace={workspace}
              onOpenChange={(open) => {
                if (!open) {
                  setEditingWorkspace(null)
                }
              }}
            />
            <InviteGuestsDialog
              workspaceId={workspace.id}
              open={invitingGuests === workspace.id}
              onOpenChange={(open) => {
                if (!open) {
                  setInvitingGuests(null)
                }
              }}
            />
          </>
        ))}
      </div>
    </div>
  )
}
