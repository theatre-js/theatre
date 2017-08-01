// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import css from './index.css'
import FolderDropzone from './FolderDropzone'
import ProjectItem from './ProjectItem'

type Props = {
  projects: Object,
}

const ProjectsPage = (props: Props) => {
  return (
    <div className={css.container}>
      <h3 className={css.title}>Projects</h3>
      <FolderDropzone css={css.dropzone} activeCss={css.activeDropzone}>
        {
          Object.entries(props.projects).map(([key, value]) => {
            return <ProjectItem key={key} project={value}/>
          })
        }
      </FolderDropzone>
    </div>
  )
}

export default compose(
  connect(
    (state) => {
      return {
        projects: state.mirrorOfLBState.projects
      }
    }
  )
)(ProjectsPage)