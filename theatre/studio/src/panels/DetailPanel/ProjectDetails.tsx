import type Project from '@theatre/core/projects/Project'
import {val} from '@theatre/dataverse'
import {usePrism} from '@theatre/dataverse-react'
import getStudio from '@theatre/studio/getStudio'
import {generateDiskStateRevision} from '@theatre/studio/StudioStore/generateDiskStateRevision'
import React, {useCallback, useState} from 'react'

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
      const useBrowserState = () => {
        getStudio().transaction(({stateEditors}) => {
          stateEditors.coreByProject.historic.revisionHistory.add({
            projectId,
            revision: loadingState.onDiskState.revisionHistory[0],
          })

          stateEditors.coreByProject.historic.revisionHistory.add({
            projectId,
            revision: generateDiskStateRevision(),
          })
        })
      }

      const useOnDiskState = () => {
        getStudio().transaction(({drafts}) => {
          drafts.historic.coreByProject[projectId] = loadingState.onDiskState
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

  return (
    <>
      {nn}
      <div>
        <button
          onClick={!downloaded ? exportProject : undefined}
          disabled={downloaded}
        >
          Export project {downloaded ? 'Done' : ''}
        </button>
      </div>
    </>
  )
}

export default ProjectDetails
