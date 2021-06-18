import {val} from '@theatre/dataverse'
import {usePrism} from '@theatre/shared/utils/reactDataverse'
import getStudio from '@theatre/studio/getStudio'
import React from 'react'
import styled from 'styled-components'
import ProjectListItem from './ProjectListItem'

const Container = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ProjectsList: React.FC<{}> = (props) => {
  return usePrism(() => {
    const projects = val(getStudio().projectsP)

    return (
      <Container>
        {Object.keys(projects).map((projectId) => {
          const project = projects[projectId]
          return (
            <ProjectListItem
              depth={0}
              project={project}
              key={`projectListItem-${projectId}`}
            />
          )
        })}
      </Container>
    )
  }, [])
}

export default ProjectsList
