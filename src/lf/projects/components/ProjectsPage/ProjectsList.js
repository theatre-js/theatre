// @flow
import React from 'react'
import ProjectItem from './ProjectItem'
import {type ProjectsNamespaceState} from '$lb/projects/types'

type Props = {
  projects: ProjectsNamespaceState,
  forgetHandler: Function,
}

const ProjectsList = (props: Props) => {
  const {listOfPaths, byPath} = props.projects
  return (
    <div>
      {
        listOfPaths.map((path) => {
          return (
            <ProjectItem
              key={path}
              path={path.slice(1)}
              projectDesc={byPath[path]}
              onForget={() => props.forgetHandler(path)} />
          )
        })
      }
    </div>
  )
}

export default ProjectsList
