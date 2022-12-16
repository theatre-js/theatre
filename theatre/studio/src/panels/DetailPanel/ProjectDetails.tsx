import type Project from '@theatre/core/projects/Project'
import getStudio from '@theatre/studio/getStudio'
import BasicPopover from '@theatre/studio/uiComponents/Popover/BasicPopover'
import usePopover from '@theatre/studio/uiComponents/Popover/usePopover'
import React, {useCallback, useState} from 'react'
import styled from 'styled-components'
import DetailPanelButton from '@theatre/studio/uiComponents/DetailPanelButton'
import StateConflictRow from './ProjectDetails/StateConflictRow'
import JSZip from 'jszip'

const Container = styled.div``

const TheExportRow = styled.div`
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`

const ExportTooltip = styled(BasicPopover)`
  display flex;
  flex-direction: column;
  gap: 1em;
  width: 280px;
  padding: 1em;
`

function saveFile(content: string | Blob, fileName: string) {
  const file = new File([content], fileName)
  const objUrl = URL.createObjectURL(file)
  const a = Object.assign(document.createElement('a'), {
    href: objUrl,
    target: '_blank',
    rel: 'noopener',
  })
  a.setAttribute('download', fileName)
  a.click()

  setTimeout(() => {
    URL.revokeObjectURL(objUrl)
  }, 40000)
}

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

  const exportProject = useCallback(async () => {
    const assetIDs = project.assetStorage.getAssetIDs()

    if (assetIDs.length > 0) {
      const zip = new JSZip()

      await Promise.all(
        assetIDs.map(async (assetID) => {
          const assetUrl = project.getAssetUrl(assetID)
          if (!assetUrl) return

          const blob = await fetch(assetUrl).then((r) => r.blob())
          zip.file(assetID, blob)
        }),
      )

      const assetsFile = await zip.generateAsync({type: 'blob'})
      saveFile(assetsFile, `${slugifiedProjectId}.assets.zip`)
    }

    const str = JSON.stringify(
      getStudio().createContentOfSaveFile(project.address.projectId),
      null,
      2,
    )

    saveFile(str, suggestedFileName)

    setDownloaded(true)
    setTimeout(() => {
      setDownloaded(false)
    }, 2000)
  }, [project, suggestedFileName])

  const exportTooltip = usePopover(
    {debugName: 'ProjectDetails', pointerDistanceThreshold: 50},
    () => (
      <ExportTooltip>
        <p>
          This will create a JSON file with the state of your project. You can
          commit this file to your git repo and include it in your production
          bundle.
        </p>
        <p>
          If your project uses assets, this will also create a zip file with all
          the assets that you can unpack in your public folder.
        </p>
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
      {exportTooltip.node}
      <Container>
        <StateConflictRow projectId={projectId} />
        <TheExportRow>
          <DetailPanelButton
            onMouseEnter={(e) =>
              exportTooltip.open(e, e.target as unknown as HTMLButtonElement)
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
