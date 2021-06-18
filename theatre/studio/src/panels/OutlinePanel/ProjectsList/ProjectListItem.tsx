import type Project from '@theatre/core/projects/Project'
import React, {useCallback} from 'react'
import styled from 'styled-components'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import SheetsList from '@theatre/studio/panels/OutlinePanel/SheetsList/SheetsList'
import getStudio from '@theatre/studio/getStudio'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import {getOutlineSelection} from '@theatre/studio/selectors'

const Container = styled.li<{depth: number}>`
  --depth: ${(props) => props.depth};
  margin: 0;
  padding: 0;
  list-style: none;
`

const Head = styled.div<{depth: number}>`
  padding-left: calc(16px + var(--depth) * 20px);

  display: flex;
  align-items: center;

  box-sizing: border-box;
`

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
