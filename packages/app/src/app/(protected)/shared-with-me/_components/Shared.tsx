'use client'

import {api} from '~/trpc/react'
import WorkspaceThumb from '../../_components/WorkspaceThumb'

export default function Shared() {
  const workspaces = api.workspaces.getAll.useQuery().data!
  const sharedWorkspaces = workspaces.filter(
    (workspace) => workspace.accessType === 'GUEST',
  )

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center group">
          <h2 className="text-2xl font-semibold tracking-tight">
            Shared with me
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 w-full">
        {sharedWorkspaces?.map((workspace) => (
          <>
            <WorkspaceThumb
              key={workspace.id}
              name={workspace.name}
              description={workspace.description}
              // thumbnail={workspace.thumbnail}
              thumbnail="/butterfly.png"
            />
          </>
        ))}
      </div>
    </div>
  )
}
