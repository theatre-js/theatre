import type Project from '@theatre/core/projects/Project'
import React, {useCallback} from 'react'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import SheetsList from '@theatre/studio/panels/OutlinePanel/SheetsList/SheetsList'
import getStudio from '@theatre/studio/getStudio'
import {usePrism} from '@theatre/dataverse-react'
import {getOutlineSelection} from '@theatre/studio/selectors'

const ProjectListItem: React.FC<{
  depth: number
  project: Project
}> = ({depth, project}) => {
  const selection = usePrism(() => getOutlineSelection(), [])
  const select = useCallback(() => {
    getStudio().transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([project])
    })
  }, [project])
  return (
    <BaseItem
      depth={depth}
      label={project.address.projectId}
      children={<SheetsList project={project} depth={depth + 1} />}
      selectionStatus={
        selection.includes(project)
          ? 'selected'
          : selection.some(
              (s) => s.address.projectId === project.address.projectId,
            )
          ? 'descendant-is-selected'
          : 'not-selected'
      }
      select={select}
    ></BaseItem>
  )
}

export default ProjectListItem
