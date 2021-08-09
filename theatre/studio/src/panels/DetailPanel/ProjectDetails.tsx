import type Project from '@theatre/core/projects/Project'
import getStudio from '@theatre/studio/getStudio'
import React, {useCallback, useState} from 'react'

const ProjectDetails: React.FC<{
  projects: Project[]
}> = ({projects}) => {
  const project = projects[0]

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
    <div>
      <button
        onClick={!downloaded ? exportProject : undefined}
        disabled={downloaded}
      >
        Export project {downloaded ? 'Done' : ''}
      </button>
    </div>
  )
}

export default ProjectDetails
