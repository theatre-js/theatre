import type Project from '@theatre/core/projects/Project'
import {val} from '@theatre/dataverse'
import {usePrism} from '@theatre/dataverse-react'
import getStudio from '@theatre/studio/getStudio'
import {generateDiskStateRevision} from '@theatre/studio/StudioStore/generateDiskStateRevision'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import {rowBgColor} from './propEditors/utils/SingleRowPropEditor'

const Container = styled.div`
  background-color: ${rowBgColor};
`

const TheExportRow = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const Button = styled.button<{disabled?: boolean}>`
  text-align: center;
  padding: 8px;
  border-radius: 2px;
  border: 1px solid #627b7b87;
  background-color: #4b787d3d;
  color: #eaeaea;
  font-weight: 400;
  display: block;
  appearance: none;
  flex-grow: 1;
  cursor: ${(props) => (props.disabled ? 'none' : 'pointer')};
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};

  &:hover {
    background-color: #7dc1c878;
    border-color: #9ebcbf;
  }
`

const ExportTooltip = styled(BasicPopover)`
  width: 280px;
  padding: 1em;
`

const ProjectDetails: React.FC<{
  projects: Project[]
}> = ({projects}) => {
  const project = projects[0]

  const projectId = project.address.projectId
  const nn = usePrism(() => {
    const loadingState = val(
      getStudio().atomP.ephemeral.coreByProject[projectId].loadingState,
    )
    if (!loadingState) return
    if (loadingState.type === 'browserStateIsNotBasedOnDiskState') {
      /**
       * This stuff is not undo-safe, but once we switch to the new persistence
       * scheme, these will be unnecessary anyway.
       */
      const useBrowserState = () => {
        getStudio().transaction(({drafts, stateEditors}) => {
          stateEditors.coreByProject.historic.revisionHistory.add({
            projectId,
            revision: loadingState.onDiskState.revisionHistory[0],
          })

          stateEditors.coreByProject.historic.revisionHistory.add({
            projectId,
            revision: generateDiskStateRevision(),
          })

          drafts.ephemeral.coreByProject[projectId].loadingState = {
            type: 'loaded',
          }
        })
      }

      const useOnDiskState = () => {
        getStudio().transaction(({drafts}) => {
          drafts.historic.coreByProject[projectId] = loadingState.onDiskState
          drafts.ephemeral.coreByProject[projectId].loadingState = {
            type: 'loaded',
          }
        })
      }
      return (
        <div>
          Browser state is not based on disk state.
          <button onClick={useBrowserState}>Use browser's state</button>
          <button onClick={useOnDiskState}>Use disk state</button>
        </div>
      )
    }
  }, [project])

  const [downloaded, setDownloaded] = useState(false)

  const exportProject = useCallback(() => {
    const str = JSON.stringify(
      getStudio().createExportedStateOfProject(project.address.projectId),
      null,
      2,
    )
    const file = new File([str], 'state.json', {type: 'application/json'})
    const objUrl = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = objUrl
    a.target = '_blank'
    a.setAttribute('download', 'state.json')
    a.rel = 'noopener'
    a.click()

    setDownloaded(true)
    setTimeout(() => {
      setDownloaded(false)
    }, 2000)

    setTimeout(() => {
      URL.revokeObjectURL(objUrl)
    }, 40000)
  }, [])

  const [tooltip, openExportTooltip] = usePopover(
    {pointerDistanceThreshold: 50},
    () => (
      <ExportTooltip>
        This will create a JSON file with the state of your project. You can
        commit this file to your git repo and include it in your production
        bundle.{' '}
        <a href="https://docs.theatrejs.com/export.html" target="_blank">
          Here is a quick guide on how to export to production.
        </a>
      </ExportTooltip>
    ),
  )

  return (
    <>
      {nn}
      {tooltip}
      <Container>
        <TheExportRow>
          <Button
            onMouseEnter={(e) =>
              openExportTooltip(e, e.target as unknown as HTMLButtonElement)
            }
            onClick={!downloaded ? exportProject : undefined}
            disabled={downloaded}
          >
            {downloaded ? '(Exported)' : `Export ${projectId} to JSON`}
          </Button>
        </TheExportRow>
      </Container>
    </>
  )
}

export default ProjectDetails
