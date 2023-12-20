import type Project from '@theatre/core/projects/Project'
import React, {useCallback} from 'react'
import BaseItem from '@theatre/studio/panels/OutlinePanel/BaseItem'
import SheetsList from '@theatre/studio/panels/OutlinePanel/SheetsList/SheetsList'
import getStudio from '@theatre/studio/getStudio'
import {usePrism, useVal} from '@theatre/react'
import {outlineSelection} from '@theatre/studio/selectors'
import {val} from '@theatre/dataverse'
import styled from 'styled-components'
import {useCollapseStateInOutlinePanel} from '@theatre/studio/panels/OutlinePanel/outlinePanelUtils'
import useChordial from '@theatre/studio/uiComponents/chordial/useChodrial'

const ConflictNotice = styled.div`
  color: #ff6363;
  margin-left: 11px;
  background: #4c282d;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 10px;
  box-shadow: 0 2px 8px -4px black;
`

const ProjectListItem: React.FC<{
  depth: number
  project: Project
}> = ({depth, project}) => {
  const selection = useVal(outlineSelection)

  const hasConflict = usePrism(() => {
    const projectId = project.address.projectId
    const loadingState = val(
      getStudio().ephemeralAtom.pointer.coreByProject[projectId].loadingState,
    )
    return loadingState?.type === 'browserStateIsNotBasedOnDiskState'
  }, [project])

  const select = useCallback(() => {
    getStudio().transaction(({stateEditors}) => {
      stateEditors.studio.historic.panels.outline.selection.set([
        {...project.address, type: 'Project'},
      ])
    })
  }, [project])

  const {collapsed, setCollapsed} = useCollapseStateInOutlinePanel(project)

  const {targetRef} = useChordial(() => {
    return {
      title: `Project: ${project.address.projectId}`,
      items: [],
    }
  })

  return (
    <BaseItem
      depth={depth}
      label={project.address.projectId}
      setIsCollapsed={setCollapsed}
      collapsed={collapsed}
      headerRef={targetRef}
      labelDecoration={
        hasConflict ? <ConflictNotice>Has Conflicts</ConflictNotice> : null
      }
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
    />
  )
}

export default ProjectListItem
