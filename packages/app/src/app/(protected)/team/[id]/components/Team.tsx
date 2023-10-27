'use client'

import {useState} from 'react'
import WorkspaceThumb from '~/app/(protected)/_components/WorkspaceThumb'
import {api} from '~/trpc/react'
import NewWorkspaceDialog from '~/app/(protected)/_components/NewWorkspaceDialog'
import EditWorkspaceDialog from '~/app/(protected)/_components/EditWorkspaceDialog'
import {useToast} from '~/ui/components/ui/use-toast'
import InviteGuestsDialog from '~/app/(protected)/_components/InviteGuestsDialog'

export default function Team({id}: {id: string}) {
  const {data: team} = api.teams.get.useQuery({id})
  const {mutateAsync: deleteWorkspace} = api.workspaces.delete.useMutation()
  const {mutateAsync: duplicateWorkspace} =
    api.workspaces.duplicate.useMutation()
  const queryUtils = api.useUtils()
  const workspaces = team?.workspaces
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null)
  const [invitingGuests, setInvitingGuests] = useState<string | null>(null)

  const {toast} = useToast()

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">{team?.name}</h2>
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
