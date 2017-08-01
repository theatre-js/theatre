// @flow
import React from 'react'
import compose from 'ramda/src/compose'
import {connect} from 'react-redux'
import {type StoreState} from '$lf/types'
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
            return <ProjectItem key={key} project={value} onForget={() => {}}/>
          })
        }
      </FolderDropzone>
    </div>
  )
}

export default compose(
  connect(
    (state: StoreState) => {
      return {
        projects: state.mirrorOfLBState
          && state.mirrorOfLBState.projects
          && state.mirrorOfLBState.projects
      }
    }
  )
)(ProjectsPage)
