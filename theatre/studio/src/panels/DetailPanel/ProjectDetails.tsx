import type Project from '@theatre/core/projects/Project'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'

const ProjectDetails: React.FC<{
  projects: Project[]
}> = ({projects}) => {
  const project = projects[0]

  const exportProject = () => {
    const str = getStudio().createExportedStateOfProject(
      project.address.projectId,
    )
    const file = new File([str], 'state.json', {type: 'application/json'})
    const objUrl = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = objUrl
    a.target = '_blank'
    a.setAttribute('download', 'state.json')
    a.click()
  }

  return (
    <div>
      <button onClick={exportProject}>Export project</button>
    </div>
  )
}

export default ProjectDetails
