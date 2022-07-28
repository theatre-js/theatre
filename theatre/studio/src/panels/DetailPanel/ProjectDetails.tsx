import type Project from '@theatre/core/projects/Project'
import getStudio from '@theatre/studio/getStudio'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import DetailPanelButton from '@theatre/studio/uiComponents/DetailPanelButton'
import StateConflictRow from './ProjectDetails/StateConflictRow'

const Container = styled.div``

const TheExportRow = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  const slugifiedProjectId = projectId.replace(/[^\w\d'_\-]+/g, ' ').trim()
  // const [dateString, _timeString] = new Date().toISOString().split('T')
  // e.g. `Butterfly.theatre-project-state.json`
  const suggestedFileName = `${slugifiedProjectId}.theatre-project-state.json`

  const [downloaded, setDownloaded] = useState(false)

  const exportProject = useCallback(() => {
    const str = JSON.stringify(
      getStudio().createContentOfSaveFile(project.address.projectId),
      null,
      2,
    )
    const file = new File([str], suggestedFileName, {
      type: 'application/json',
    })
    const objUrl = URL.createObjectURL(file)
    const a = Object.assign(document.createElement('a'), {
      href: objUrl,
      target: '_blank',
      rel: 'noopener',
    })
    a.setAttribute('download', suggestedFileName)
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
    {debugName: 'ProjectDetails', pointerDistanceThreshold: 50},
    () => (
      <ExportTooltip>
        This will create a JSON file with the state of your project. You can
        commit this file to your git repo and include it in your production
        bundle.
        <a
          href="https://docs.theatrejs.com/in-depth/#exporting"
          target="_blank"
        >
          Here is a quick guide on how to export to production.
        </a>
      </ExportTooltip>
    ),
  )

  return (
    <>
      {tooltip}
      <Container>
        <StateConflictRow projectId={projectId} />
        <TheExportRow>
          <DetailPanelButton
            onMouseEnter={(e) =>
              openExportTooltip(e, e.target as unknown as HTMLButtonElement)
            }
            onClick={!downloaded ? exportProject : undefined}
            disabled={downloaded}
          >
            {downloaded ? '(Exported)' : `Export ${projectId} to JSON`}
          </DetailPanelButton>
        </TheExportRow>
      </Container>
    </>
  )
}

export default ProjectDetails
