// @flow
import React from 'react'
import ProjectItem from './ProjectItem'
import css from './ProjectsList.css'
import {type ProjectsNamespaceState} from '$lb/projects/types'

type Props = {
  projects: ProjectsNamespaceState,
  forgetHandler: Function,
}

const ProjectsList = (props: Props) => {
  const {listOfPaths, byPath} = props.projects
  const hasItems = listOfPaths.length > 0
  return (
    <div>
      { hasItems
        ?
        listOfPaths.map((path) => {
          return (
            <ProjectItem
              key={path}
              path={path}
              projectDesc={byPath[path]}
              onForget={() => props.forgetHandler(path)} />
          )
        })
        :
        <div className={css.noItem}>No project added/created yet!</div>
      }
    </div>
  )
}

export default ProjectsList
