import type Project from '@theatre/core/projects/Project'
import React from 'react'

const ProjectDetails: React.FC<{
  projects: Project[]
}> = ({projects}) => {
  const project = projects[0]

  return <div>editing project {project.address.projectId}</div>
}

export default ProjectDetails
